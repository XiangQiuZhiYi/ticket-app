<template>
  <view class="my-container">
    <CustomNavBar title="我的票根" :showBack="true" />
    
    <view class="list">
      <view v-if="!ticketList.length" class="empty">
        <text>你还没有票根，快去添加一个吧</text>
      </view>

      <block v-else>
        <view v-for="(t, i) in ticketList" :key="i" class="card" @click="openDetail(i)">
          <view class="card-left">
            <text class="train">{{ t.trainNumber || '-' }}</text>
            <text class="route">{{ t.departureCity || t.departure }} → {{ t.arrivalCity || t.destination }}</text>
            <text class="time">{{ t.departureDate }} {{ t.departureTime }}</text>
          </view>
          <view class="card-right">
            <text class="price">{{ t.price ? '¥' + t.price : '' }}</text>
            <text class="name-small">{{ t.name }}</text>
            <button class="del" @click.stop.prevent="removeTicket(i)">删除</button>
          </view>
        </view>
      </block>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CustomNavBar from '@/components/CustomNavBar/index.vue'

const ticketList = ref([])

const loadTickets = () => {
  try {
    const list = uni.getStorageSync('tickets') || []
    ticketList.value = list
  } catch (e) {
    ticketList.value = []
  }
}

onMounted(() => {
  loadTickets()
})

const handleAddClick = () => {
  uni.navigateTo({ url: '/pages/create/index' })
}

const openDetail = (index) => {
  uni.navigateTo({ url: `/pages/detail/index?index=${index}` })
}

const removeTicket = (index) => {
  const list = ticketList.value
  list.splice(index, 1)
  ticketList.value = list
  try { uni.setStorageSync('tickets', list) } catch (e) {}
}
</script>

<style lang="scss" scoped>
@import './index.scss';

.my-container { background: #0b0b0d; min-height: 100vh; padding-bottom: 80rpx; }
.profile { display:flex; align-items:center; padding: 18rpx; gap:12rpx }
.avatar { width: 88rpx; height: 88rpx; border-radius: 44rpx }
.profile-info { flex:1 }
.name { color:#fff; font-size:16px }
.sub { color:#9a9a9a; font-size:12px }
.action { background: linear-gradient(90deg,#9b6bff,#7d5cff); color:#fff; padding:6rpx 12rpx; border-radius:12rpx }
.list { padding: 12rpx }
.empty { text-align:center; color:#9a9a9a; padding: 40rpx 0 }
.card { display:flex; justify-content:space-between; background: #0f0f12; padding:12rpx; border-radius:10rpx; margin-bottom:10rpx }
.card-left { color:#fff }
.train { font-weight:700 }
.route { color:#bfbfbf; font-size:12px }
.time { color:#9a9a9a; font-size:12px }
.card-right { text-align:right }
.price { color:#ffd36a; font-weight:700 }
.name-small { color:#9a9a9a; font-size:12px }
.del { margin-top:8rpx; color:#ff7b7b; background:transparent; border:none }

</style>