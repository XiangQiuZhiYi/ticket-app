

export const postImage = async (files) => {
  const authorId = uni.getStorageSync('userInfo')._id || 'guest_'
  const urlList = []
  const filesList = []
  for (let i = 0; i < files.length; i++) {
    if(files[i].noUpload){
      urlList.push(files[i].url)
    }else{
      urlList.push(false)
      const res = await wx.cloud.uploadFile({
        // 指定上传到的云路径
        cloudPath: authorId + new Date().getTime()+ '.png',
        // 指定要上传的文件的小程序临时文件路径
        filePath: files[i].url,
        // 成功回调
      })
      filesList.push(res.fileID)
    }
  }

  if(filesList.length > 0){
    const fileUrlList = await wx.cloud.getTempFileURL({
      fileList: filesList
    })
    for (let i = 0, num = 0; i < urlList.length; i++) {
      if(urlList[i] === false){
        urlList[i] = fileUrlList.fileList[num].tempFileURL
        num++;
      }
    }
  }

  return urlList
}
