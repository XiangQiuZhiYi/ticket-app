const generateQRCode = require('./generateQRCode/index');

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'generateQRCode':
      return await generateQRCode.main(event, context);
    default:
      // 默认执行生成二维码（保持向后兼容）
      return await generateQRCode.main(event, context);
  }
};
