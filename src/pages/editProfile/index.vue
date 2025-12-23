<template>
  <view class="edit-profile-page">
    <CustomNavBar :title="pageTitle" :showBack="true" />

    <view class="content">
      <view class="form-section">
        <view class="form-label">{{ fieldLabel }}</view>
        <view class="input-wrapper">
          <input
            v-if="field === 'nickName'"
            v-model="inputValue"
            class="form-input"
            :placeholder="`请输入${fieldLabel}`"
            maxlength="20"
          />
          <textarea
            v-else
            v-model="inputValue"
            class="form-textarea"
            :placeholder="`请输入${fieldLabel}`"
            maxlength="200"
            :auto-height="true"
          />
        </view>
        <view class="char-count" v-if="field === 'profile'">
          {{ inputValue.length }}/200
        </view>
      </view>

      <view class="save-btn" @click="saveProfile">
        <text class="save-text">保存</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import { getLocalUser, updateLocalUser } from "@/utils/auth";

const field = ref("");
const inputValue = ref("");
const currentUser = ref(null);

const pageTitle = computed(() => {
  return field.value === "nickName" ? "编辑昵称" : "编辑个人简介";
});

const fieldLabel = computed(() => {
  return field.value === "nickName" ? "昵称" : "个人简介";
});

onMounted(async () => {
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options;
  
  field.value = options.field || "nickName";
  
  // 加载当前用户信息
  const user = await getLocalUser();
  if (user) {
    currentUser.value = user;
    inputValue.value = user[field.value] || "";
  }
});

const saveProfile = async () => {
  if (!inputValue.value.trim()) {
    uni.showToast({
      title: `请输入${fieldLabel.value}`,
      icon: "none",
    });
    return;
  }

  try {
    // 更新本地用户信息
    const updatedUser = {
      ...currentUser.value,
      [field.value]: inputValue.value.trim(),
    };
    
    await updateLocalUser(updatedUser);

    // 这里可以添加调用云函数更新服务器数据的逻辑
    // await updateUserProfile({ [field.value]: inputValue.value.trim() });

    uni.showToast({
      title: "保存成功",
      icon: "success",
    });

    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    console.error("保存失败:", error);
    uni.showToast({
      title: "保存失败，请重试",
      icon: "none",
    });
  }
};
</script>

<style lang="scss" scoped>
.edit-profile-page {
  background: #0b0b0d;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 32rpx 30rpx;
}

.form-section {
  background: #151515;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 40rpx;
}

.form-label {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
}

.input-wrapper {
  width: 100%;
}

.form-input {
  width: 100%;
  background: #1f1f1f;
  border: none;
  border-radius: 16rpx;
  padding: 24rpx;
  color: #fff;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  background: #1f1f1f;
  border: none;
  border-radius: 16rpx;
  padding: 24rpx;
  color: #fff;
  font-size: 28rpx;
  min-height: 200rpx;
  box-sizing: border-box;
}

.char-count {
  text-align: right;
  color: #666;
  font-size: 24rpx;
  margin-top: 12rpx;
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 28rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.save-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
