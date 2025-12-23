<template>
  <view class="preview-page">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-box">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 空状态 -->
    <view v-else-if="!imageList.length" class="empty-box">
      <text class="empty-text">暂无图片</text>
    </view>

    <!-- 轮播图 -->
    <view v-else class="swiper-container">
      <swiper 
        class="swiper" 
        :current="currentIndex"
        @change="onSwiperChange"
        :indicator-dots="false"
        :circular="false"
      >
        <swiper-item v-for="(image, index) in imageList" :key="index">
          <view class="swiper-item">
            <image 
              :src="image" 
              mode="aspectFit" 
              class="preview-image"
              @tap="toggleInfo"
            />
          </view>
        </swiper-item>
      </swiper>

      <!-- 自定义指示器 -->
      <view class="indicator" v-if="showInfo && imageList.length > 1">
        <text class="indicator-text">{{ currentIndex + 1 }} / {{ imageList.length }}</text>
      </view>

      <!-- 票根信息 -->
      <view class="image-info" v-if="showInfo && ticketData">
        <text class="info-title">{{ ticketData.trainNumber }} {{ ticketData.startStation }} → {{ ticketData.endStation }}</text>
        <text class="info-desc" v-if="ticketData.departureDate">{{ ticketData.departureDate }} {{ ticketData.departureTime }} 开</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getTicketById, getTicketByShortId } from "@/api/tickets";
import sampleTicket from "@/utils/sampleTicket";

const loading = ref(true);
const ticketData = ref(null);
const ticketId = ref('');
const imageList = ref([]);
const currentIndex = ref(0);
const showInfo = ref(true);
const isDemo = ref(false);

const setImageList = (images = [], wxacodeUrl = '') => {
  const normalized = (images || [])
    .map(img => {
      if (!img) return '';
      if (typeof img === 'string') return img;
      if (typeof img === 'object') {
        return img.url || img.fileID || img.path || '';
      }
      return '';
    })
    .filter(Boolean);
  if (wxacodeUrl) {
    normalized.push(wxacodeUrl);
  }
  imageList.value = normalized;
};

// 加载票根数据
const loadTicketData = async () => {
  if (!ticketId.value) {
    uni.showToast({
      title: '票根ID不存在',
      icon: 'none'
    });
    loading.value = false;
    return;
  }
  
  try {
    loading.value = true;
    
    // 先尝试用shortId查询，如果失败再用完整ID查询
    let res = null;
    
    // 判断是否为短ID（长度较短，通常8-12位）
    if (ticketId.value.length <= 12) {
      try {
        res = await getTicketByShortId(ticketId.value);
      } catch (e) {
        console.log('短ID查询失败，尝试完整ID查询', e);
      }
    }
    
    if (res && res.data && res.data.length > 0) {
      ticketData.value = {
        ...res.data[0],
        _id: res.data[0]._id || ticketId.value
      };
      
      // 获取二维码/条形码图片列表
      imageList.value = ticketData.value.barcodeImages || [];
    } else {
      uni.showToast({
        title: '票根不存在',
        icon: 'none'
      });
    }
  } catch (e) {
    console.error('加载票根数据失败:', e);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 轮播切换事件
const onSwiperChange = (e) => {
  currentIndex.value = e.detail.current;
};

// 切换信息显示
const toggleInfo = () => {
  showInfo.value = !showInfo.value;
};

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options;
  
  console.log('页面参数:', options);
  
  // 从 scene 参数或 id 参数获取票根 ID
  // scene 参数是从小程序码扫描进来的
  if (options.demo === '1' || options.demo === 'true') {
    isDemo.value = true;
    ticketData.value = { ...sampleTicket };
    setImageList(sampleTicket.barcodeImages);
    loading.value = false;
    return;
  }

  if (options.scene) {
    ticketId.value = decodeURIComponent(options.scene);
    
    console.log('从 scene 获取 ID:', ticketId.value);
  } else if (options.id) {
    ticketId.value = options.id;
    console.log('从 id 获取 ID:', ticketId.value);
  }
  
  if (ticketId.value) {
    loadTicketData();
  } else {
    loading.value = false;
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    });
  }
});
</script>

<style lang="scss" scoped>
.preview-page {
  background: #000;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.loading-box,
.empty-box {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text,
.empty-text {
  color: #999;
  font-size: 28rpx;
}

.swiper-container {
  flex: 1;
  position: relative;
  width: 100%;
}

.swiper {
  width: 100vw;
  height: 100vh;
}

.swiper-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.indicator {
  position: absolute;
  top: 32rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  padding: 12rpx 32rpx;
  border-radius: 40rpx;
  z-index: 10;
}

.indicator-text {
  color: #fff;
  font-size: 24rpx;
  font-weight: 500;
}

.image-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 60rpx 40rpx 40rpx;
  z-index: 10;
}

.info-title {
  display: block;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.info-desc {
  display: block;
  color: #ddd;
  font-size: 26rpx;
  line-height: 1.5;
}
</style>
