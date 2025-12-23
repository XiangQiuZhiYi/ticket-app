<template>
  <view class="detail-container">
    <CustomNavBar title="票根详情" :show-back="true">
    </CustomNavBar>

    <!-- 火车票预览 -->
    <view class="ticket-wrapper">
      <!-- 普通预览 -->
      <TicketPreview 
        v-if="ticketData && !loading && !isDownloading" 
        :ticket-data="ticketData" 
      />
      
      <!-- Canvas版本（用于下载） -->
      <TicketPreview 
        v-if="ticketData && isDownloading"
        ref="canvasPreviewRef"
        :ticket-data="ticketData"
        :use-canvas="true"
        canvas-id="downloadTicketCanvas"
        class="canvas-preview"
      />
      
      <!-- 加载中 -->
      <view v-if="loading" class="loading-container">
        <text>加载中...</text>
      </view>
      
      <!-- 无数据 -->
      <view v-if="!ticketData && !loading" class="loading-container">
        <text>票根不存在</text>
      </view>
    </view>
    
    <!-- 底部操作按钮 -->
    <view v-if="ticketData && !loading" class="action-buttons">
      <view class="action-btn" @click="handleDownload">
        <text class="action-icon">↓</text>
      </view>
      <view class="action-btn primary" @click="handleEdit">
        <text class="action-text">编辑</text>
      </view>
      <view class="action-btn" @click="handleDelete">
        <text class="action-icon">🗑</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import TicketPreview from '../../components/TicketPreview/index.vue'
import { getTicketById, deleteTicket } from '@/api/tickets'
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import { saveTicketToAlbum } from '@/utils/canvasTicket';

// 获取当前组件实例
const instance = getCurrentInstance();

// 从路由参数获取票根ID
const ticketData = ref(null)
const ticketId = ref('')
const loading = ref(true)
const isDownloading = ref(false)
const canvasPreviewRef = ref(null)

// 加载票根数据
const loadTicketData = async () => {
  if (!ticketId.value) {
    uni.showToast({
      title: '票根ID不存在',
      icon: 'error'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }
  
  try {
    loading.value = true
    const res = await getTicketById(ticketId.value)
    
    if (res && res.data && res.data.length > 0) {
      ticketData.value = {
        ...res.data[0],
        _id: ticketId.value
      }
    } else {
      uni.showToast({
        title: '票根不存在',
        icon: 'error'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (e) {
    console.error('加载票根数据失败:', e)
    uni.showToast({
      title: '加载失败',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  
  if (options.id) {
    ticketId.value = options.id
    loadTicketData()
  } else if (options.index !== undefined) {
    // 兼容旧的 index 参数方式
    const index = parseInt(options.index)
    const tickets = uni.getStorageSync('tickets') || []
    if (tickets[index]) {
      ticketData.value = tickets[index]
      loading.value = false
    } else {
      uni.showToast({
        title: '票根不存在',
        icon: 'error'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } else {
    uni.showToast({
      title: '参数错误',
      icon: 'error'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

// 处理下载图片
const handleDownload = async () => {
  if (!ticketData.value) {
    uni.showToast({
      title: '票根数据不存在',
      icon: 'none'
    });
    return;
  }
  
  try {
    console.log('========== 开始下载流程 ==========');
    console.log('票根数据:', ticketData.value);
    
    uni.showLoading({
      title: '正在生成图片...',
      mask: true
    });
    
    // 切换到canvas模式
    console.log('Step 1: 切换到Canvas模式');
    isDownloading.value = true;
    
    // 等待DOM更新和Canvas渲染（增加等待时间）
    console.log('Step 2: 等待Canvas渲染...');
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    console.log('Step 3: 开始调用保存方法');
    
    // 保存到相册，传递TicketPreview组件实例的上下文
    await saveTicketToAlbum('downloadTicketCanvas', ticketData.value, canvasPreviewRef.value);
    
    console.log('Step 4: 保存完成');
    
    uni.hideLoading();
    
    // 切换回普通模式
    isDownloading.value = false;
    
    console.log('========== 下载流程完成 ==========');
    
  } catch (error) {
    console.error('========== 下载失败 ==========');
    console.error('错误详情:', error);
    
    uni.hideLoading();
    isDownloading.value = false;
    
    uni.showModal({
      title: '下载失败',
      content: error.message || '未知错误',
      showCancel: false
    });
  }
};

// 处理编辑
const handleEdit = () => {
  if (!ticketId.value && !ticketData.value._id) {
    uni.showToast({
      title: '无法编辑',
      icon: 'none'
    })
    return
  }
  
  // 跳转到编辑页面
  uni.navigateTo({
    url: `/pages/create/index?id=${ticketId.value || ticketData.value._id}&mode=edit`
  })
}

// 处理删除
const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这张票根吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          if (ticketId.value) {
            // 从云数据库删除
            await deleteTicket(ticketId.value)
          }
          
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          
          // 通知首页刷新
          uni.$emit('refreshTickets')
          
          // 返回上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 1000)
        } catch (e) {
          console.error('删除失败:', e)
          uni.showToast({
            title: '删除失败',
            icon: 'error'
          })
        }
      }
    }
  })
}
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>