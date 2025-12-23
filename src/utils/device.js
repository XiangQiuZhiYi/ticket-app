// 设备信息工具，返回 statusBarHeight、isIOS、navBarHeight 等通用值
export function getSystemDeviceInfo() {
  try {
    const info = uni.getSystemInfoSync()
    const isIOS = /iOS|iPhone|iPad/.test(info.system || '')
    // statusBarHeight 在小程序/uni-app 中通常存在
    const statusBarHeight = info.statusBarHeight || 0
    // 导航栏高度：iOS 44, Android 48 为常用值，可根据实际机型调整
    const navBarHeight = isIOS ? 44 : 48
    return { isIOS, statusBarHeight, navBarHeight, raw: info }
  } catch (e) {
    return { isIOS: false, statusBarHeight: 0, navBarHeight: 48, raw: {} }
  }
}
