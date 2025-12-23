import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)

  // 尝试在运行环境中初始化微信云（如果已设置环境变量 VUE_APP_CLOUD_ENV）
  try {
    if (typeof wx !== 'undefined' && wx.cloud) {
      const cloudEnv = process.env.VUE_APP_CLOUD_ENV || '';
      if (cloudEnv) {
        wx.cloud.init({ env: cloudEnv, traceUser: true });
      }
    }
  } catch (e) {
    // 忽略初始化失败（例如在 H5 环境或未配置时）
    console.warn('wx.cloud init skipped', e);
  }

  return {
    app
  }
}