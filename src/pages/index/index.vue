<template>
  <view class="index">
    <CustomNavBar title="">
      <template #left>
        <image class="header-icon" :src="tickets" mode="scaleToFill" />
      </template>
    </CustomNavBar>

    <view class="demo-entry" @click="handleDemoClick">
      <text class="demo-label">体验 Demo</text>
      <text class="demo-desc">查看票根预览效果</text>
    </view>

    <view class="content">
      <!-- 无票根时显示空状态 -->
      <view v-if="!ticketList.length" class="upload-wrap" @click="handleAddClick">
        <image class="home-icon" :src="homeIcon" mode="scaleToFill" />
        <text class="caption">添加票根吧~</text>
      </view>

      <!-- 有票根时显示列表 -->
      <view v-else class="ticket-list">
        <view v-for="(ticket, index) in ticketList" :key="ticket._id || index" 
              class="ticket-card" 
              @click="openDetail(ticket)">
          <view class="card-left">
            <text class="train">{{ ticket.trainNumber || '-' }}</text>
            <text class="route">
              {{ ticket.departureCity || ticket.departure }} → {{ ticket.arrivalCity || ticket.destination }}
            </text>
            <text class="time">{{ ticket.departureDate }} {{ ticket.departureTime }}</text>
          </view>
          <view class="card-right">
            <text class="price">{{ ticket.price ? '¥' + ticket.price : '' }}</text>
            <text class="seat">{{ ticket.seatClass }}</text>
            <text class="name-small">{{ ticket.name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部悬浮添加按钮 -->
    <view class="float-add-btn" @click="handleAddClick">
      <image class="add-icon" :src="addIcon" mode="scaleToFill" />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import homeIcon from "./homeIcon.png";
import tickets from "./tickets.png";
import addIcon from "../../static/tabbar/add.png";
import CustomNavBar from "@/components/CustomNavBar/index.vue";

import { getTicketsByUserId } from "@/api/tickets";
import { getLocalUser } from "@/utils/auth";
import { getMiniProgramEnv, getEnvDescription } from "@/utils/env";

const ticketList = ref([]);
const loading = ref(false);

// 加载票根列表
const loadTickets = async () => {
  try {
    loading.value = true;
    
    // 获取当前用户信息
    const user = await getLocalUser();
    
    if (user && user._id) {
      // 从云端获取票根列表
      const res = await getTicketsByUserId(user._id);
      if (res && res.data) {
        ticketList.value = res.data;
      } else {
        ticketList.value = [];
      }
    } else {
      // 未登录时尝试从本地存储获取（兼容旧数据）
      const list = uni.getStorageSync('tickets') || [];
      ticketList.value = list;
    }
  } catch (e) {
    console.error('加载票根失败:', e);
    // 失败时回退到本地存储
    try {
      const list = uni.getStorageSync('tickets') || [];
      ticketList.value = list;
    } catch (err) {
      ticketList.value = [];
    }
  } finally {
    loading.value = false;
  }
};

// 页面加载时获取票根列表
onMounted(() => {
  // 环境检测和日志输出
  const currentEnv = getMiniProgramEnv();
  console.log(`🎯 当前小程序环境: ${getEnvDescription(currentEnv)} (${currentEnv})`);
  console.log('📱 进入首页 - 环境信息:', {
    envVersion: currentEnv,
    envDescription: getEnvDescription(currentEnv),
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toLocaleString()
  });
  
  loadTickets();
});

// 监听刷新事件
const refreshHandler = () => {
  loadTickets();
};

onMounted(() => {
  uni.$on('refreshTickets', refreshHandler);
});

// 清理事件监听
onUnmounted(() => {
  uni.$off('refreshTickets', refreshHandler);
});

// 点击添加票根，跳转到创建页面
const handleAddClick = async () => {
  uni.navigateTo({ url: '/pages/create/index' });
};

// Demo 预览
const handleDemoClick = () => {
  uni.navigateTo({ url: '/pages/preview/index?74337284690dca3c02961157476c634f' });
};

// 打开票根详情
const openDetail = (ticket) => {
  if (ticket._id) {
    // 云端票根，使用 _id
    uni.navigateTo({ url: `/pages/detail/index?id=${ticket._id}` });
  } else {
    // 本地票根，使用 index（兼容旧数据）
    const index = ticketList.value.indexOf(ticket);
    uni.navigateTo({ url: `/pages/detail/index?index=${index}` });
  }
};
</script>

<script>
// uni-app页面生命周期
export default {
  onShow() {
    // 页面每次显示时刷新数据（从其他页面返回时也会触发）
    // 通过全局事件通知组件刷新
    uni.$emit('refreshTickets');
  }
}
</script>

<style lang="scss" scoped>
.index {
  min-height: 100vh;
  background: #0b0b0d;
  color: #fff;
}
.index {
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32rpx;
  box-sizing: border-box;
  /* 给 header 底部额外间距，防止内容紧贴 */
  padding-bottom: 12rpx;
  background: transparent;
}
.title {
  font-size: 20px;
  letter-spacing: 2px;
  padding: 6px 10px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  color: #fff;
  font-weight: 600;
}
.add-small {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
}

.upload-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}
.upload-box {
  width: 160px;
  height: 160px;
  border: 2px dashed rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}
.icon-wrap {
  width: 92px;
  height: 92px;
  position: relative;
}
.icon-back {
  position: absolute;
  width: 64px;
  height: 64px;
  left: 14px;
  top: 14px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
}
.icon-front {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #9b6bff, #7d5cff);
  color: #fff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  transform: rotate(-12deg);
}
.caption {
  margin-top: 14px;
  color: #bfbfbf;
}

.demo-entry {
  margin: 24rpx 32rpx 0;
  padding: 24rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.06);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.demo-label {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

.demo-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}

.header-icon {
  width: 292rpx;
  height: 80rpx;
}

.home-icon {
  width: 400rpx;
  height: 400rpx;
}

.content {
  flex: 1; /* 占据剩余空间，让 header 高度自然影响布局 */
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 8rpx;
}

.upload-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.ticket-list {
  width: 100%;
  padding: 24rpx 30rpx;
  box-sizing: border-box;
}

.ticket-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #151515;
  padding: 32rpx;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  box-sizing: border-box;
  transition: all 0.3s;
}

.ticket-card:active {
  background: #1a1a1a;
  transform: scale(0.98);
}

.card-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.train {
  color: #fff;
  font-size: 36rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.route {
  color: #bfbfbf;
  font-size: 28rpx;
  font-weight: 500;
}

.time {
  color: #9a9a9a;
  font-size: 24rpx;
  margin-top: 4rpx;
}

.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.price {
  color: #ffd36a;
  font-size: 32rpx;
  font-weight: 700;
}

.seat {
  color: #a0a0a0;
  font-size: 24rpx;
}

.name-small {
  color: #9a9a9a;
  font-size: 24rpx;
  margin-top: 4rpx;
}

.add-small {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
}

/* 底部悬浮添加按钮 */
.float-add-btn {
  position: fixed;
  right: 60rpx;
  bottom: 150rpx;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}


.add-icon {
  width: 120rpx;
  height: 120rpx;
}
</style>
