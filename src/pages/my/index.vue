<template>
  <view class="my-page">
    <CustomNavBar title="" :showBack="false" />

    <view class="header-area">
      <image
        class="avatar"
        :src="user.avatarUrl || '/static/tabbar/my.png'"
        mode="aspectFill"
      />
    </view>
    <view class="profile-shell">
      <view class="profile-section" @click="goEditProfile('nickName')">
        <view class="profile-label">昵称</view>
        <view class="profile-content">
          <text class="profile-placeholder">{{
            user.nickName || "未设置"
          }}</text>

          <image class="arrow" :src="backIcon" mode="aspectFit" />
        </view>
      </view>
      <view class="profile-section" @click="goEditProfile('profile')">
        <view class="profile-label">个人简介</view>
        <view class="profile-content">
          <text class="profile-placeholder">{{
            user.profile || "未设置"
          }}</text>
          <image class="arrow" :src="backIcon" mode="aspectFit" />
        </view>
      </view>
    </view>

    <view class="logout-btn" v-if="user._id">
      <text class="logout-text">退出登录</text>
    </view>
    <view class="logout-btn" v-else @click="handleLogin">
      <text class="login-text">立即登录</text>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import { ensureLogin, getLocalUser } from "@/utils/auth";
import { clearLocalUser } from "@/utils/auth";
import backIcon from "./back.png";

const user = ref({});

const loadLocal = async () => {
  const u = await getLocalUser();
  if (u) {
    Object.assign(user, u);
  }
};

const goEditProfile = (field) => {
  uni.navigateTo({
    url: `/pages/editProfile/index?field=${field}`,
  });
};

const getUserInfo = async () => {
  const userInfo = await getLocalUser();
  if (userInfo) {
    user.value = userInfo;
  }
};

onMounted(() => {
  getUserInfo();
});

const logout = () => {
  clearLocalUser();
  Object.keys(user).forEach((k) => delete user[k]);
  uni.showToast({ title: "已退出", icon: "none" });
};

const handleLogin = async () => {
  const res = await ensureLogin();
  user.value = res;
};
</script>

<style lang="scss" scoped>
.my-page {
  background: #0b0b0d;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0 30rpx;
}
.header-area {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 88rpx;
  margin-top: 32rpx;
}
.avatar {
  width: 204rpx;
  height: 204rpx;
  border-radius: 50%;
  background: #111;
}
.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.profile-shell {
  background: #151515;
  border-radius: 24rpx;
}

.profile-section {
  padding: 28rpx 32rpx;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}
.profile-label {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}
.profile-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.profile-placeholder {
  color: #fff;
  font-size: 28rpx;
}
.arrow {
  color: #fff;
  width: 28rpx;
  height: 28rpx;
  margin-left: 4rpx;
  transform: rotate(180deg);
}

.logout-btn {
  margin-top: 40rpx;
  padding: 24rpx;
  background: #151515;
  border-radius: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
.logout-text {
  color: #f56c6c;
  font-size: 32rpx;
  font-weight: 500;
}
.login-text {
  color: #a353f3;
  font-size: 32rpx;
  font-weight: 500;
}
</style>
