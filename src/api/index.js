// 适配 uni-app 的云开发初始化（wx.cloud）
// 优先使用环境变量 VUE_APP_CLOUD_ENV，否则回退到默认的 env id（保留历史值）
const CLOUD_ENV = 'cloud1-2gdjrvomf6db44d5'

let db = null

try {
  if (typeof wx !== 'undefined' && wx.cloud) {
    wx.cloud.init({ env: CLOUD_ENV, traceUser: true })
    db = wx.cloud.database()
    console.log('[api] wx.cloud initialized', CLOUD_ENV)
  } else {
    console.warn('[api] wx.cloud is not available in this environment')
  }
} catch (e) {
  console.warn('[api] cloud init failed', e)
}

export function getDB() {
  if (!db) throw new Error('wx.cloud database is not initialized')
  return db
}

export default db
