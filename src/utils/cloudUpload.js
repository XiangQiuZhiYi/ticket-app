// 云上传工具：在小程序端使用 wx.cloud.uploadFile 上传到微信云存储
export function uploadImageToCloud(tempFilePath) {
  return new Promise((resolve, reject) => {
    if (typeof wx !== 'undefined' && wx.cloud && wx.cloud.uploadFile) {
      const ext = (tempFilePath.split('.').pop() || 'jpg').split('?')[0]
      const cloudPath = `tickets/${Date.now()}-${Math.random().toString(36).slice(2,9)}.${ext}`
      wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath,
        success: (res) => {
          resolve(res.fileID)
        },
        fail: (err) => reject(err)
      })
    } else {
      reject(new Error('wx.cloud.uploadFile not available on this platform'))
    }
  })
}

export async function uploadImages(paths = []) {
  const results = []
  for (const p of paths) {
    // skip already cloud paths
    if (typeof p === 'string' && p.startsWith('cloud://')) {
      results.push(p)
      continue
    }
    // temp file (local) upload
    // 在非小程序平台上抛错
    // eslint-disable-next-line no-await-in-loop
    const id = await uploadImageToCloud(p)
    results.push(id)
  }
  return results
}
