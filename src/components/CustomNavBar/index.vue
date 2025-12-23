<template>
  <view class="custom-nav" :style="containerStyle">
    <view class="nav-inner">
      <view class="left">
        <slot name="left">
          <template v-if="props.showBack">
            <image
              :src="props.backIcon"
              :style="{
                width: props.backSize + 'rpx',
                height: props.backSize + 'rpx',
              }"
              @click="onBack"
              mode="aspectFit"
            />
          </template>
        </slot>
      </view>

      <view class="center"
        ><slot name="center">{{ props.title }}</slot></view
      >

      <view class="right"><slot name="right"></slot></view>
    </view>
  </view>
  <view
    v-if="props.sticky"
    class="nav-spacer"
    :style="{ height: containerHeight + 'px' }"
  ></view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getSystemDeviceInfo } from "@/utils/device";
import back from './back.png'

const props = defineProps({
  // 背景颜色
  backgroundColor: { type: String, default: '#090808' },
  title: { type: String, default: "" },
  // 是否显示底部分割线
  border: { type: Boolean, default: false },
  // 是否显示返回按钮（默认不显示）
  showBack: { type: Boolean, default: false },
  // 返回图标路径（如果不传使用默认符号）
  backIcon: { type: String, default: back },
  // 返回图标大小（px）
  backSize: { type: Number, default: 48 },
  // 是否吸顶（默认启用）
  sticky: { type: Boolean, default: true },
});

const statusBarHeight = ref(0);
const navBarHeight = ref(44); // default
const isIOS = ref(false);

onMounted(() => {
  const info = getSystemDeviceInfo();
  statusBarHeight.value = info.statusBarHeight || 0;
  isIOS.value = info.isIOS;
  navBarHeight.value = info.navBarHeight || (isIOS.value ? 44 : 48);
});

const containerHeight = computed(
  () => statusBarHeight.value + navBarHeight.value
);

const containerStyle = computed(() => {
  const base = {
    backgroundColor: props.backgroundColor,
    paddingTop: statusBarHeight.value + "px",
    height: containerHeight.value + "px",
    borderBottom: props.border ? "1px solid rgba(255,255,255,0.04)" : "none",
  };
  if (props.sticky) {
    // 固定定位
    return Object.assign({}, base, {
      position: "fixed",
      top: "0px",
      left: "0px",
      right: "0px",
      zIndex: 9999,
    });
  }
  return base;
});

const emit = defineEmits(["back"]);

const onBack = () => {
  // 更安全的返回逻辑：先检查页面栈，避免在首页调用 navigateBack 导致报错
  try {
    let canBack = false;
    if (typeof getCurrentPages === "function") {
      const pages = getCurrentPages();
      if (pages && pages.length > 1) canBack = true;
    }
    if (canBack) {
      uni.navigateBack();
    } else {
      // 无法返回（可能是首个页面），尝试切换到首页或重启路由
      try {
        uni.switchTab({ url: "/pages/index/index" });
      } catch (e) {
        uni.reLaunch({ url: "/pages/index/index" });
      }
    }
  } catch (err) {
    // 兜底：若以上都失败，仍尝试 reLaunch
    try {
      uni.reLaunch({ url: "/pages/index/index" });
    } catch (e) {}
  }
  emit("back");
};
</script>

<style scoped lang="scss">
.custom-nav {
  width: 100%;
  box-sizing: border-box;
}
.nav-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}
.center {
  align-items: center;
  text-align: center;
}
.center {
  flex: 1;
  justify-content: center;
  font-weight: 600;
  color: #fff;
}
.left {
  width: 64px;
}
.right {
  width: 64px;
  justify-content: flex-end;
}
.default-back {
  color: #fff;
  font-size: 22px;
  padding: 6px 10px;
}
.nav-spacer {
  width: 100%;
  display: block;
}
</style>
