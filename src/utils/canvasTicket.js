// 票根Canvas绘制工具
// 用于将票根信息绘制到canvas，便于生成图片下载

/**
 * 绘制票根到Canvas
 * @param {Object} canvasContext - Canvas 2D上下文
 * @param {Object} ticketData - 票根数据
 * @param {Number} width - Canvas宽度
 * @param {Number} height - Canvas高度
 */
export const drawTicketToCanvas = (canvasContext, ticketData, width = 750, height = 400) => {
  const ctx = canvasContext;
  const scale = width / 750; // 基准宽度750rpx
  
  // 清空画布
  ctx.clearRect(0, 0, width, height);
  
  // 设置背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  // 设置边框
  ctx.strokeStyle = '#e5e5e5';
  ctx.lineWidth = 2 * scale;
  ctx.strokeRect(10 * scale, 10 * scale, width - 20 * scale, height - 20 * scale);
  
  let y = 30 * scale;
  const leftPadding = 30 * scale;
  
  // 1. 绘制顶部：车次和检票口
  ctx.font = `bold ${28 * scale}px sans-serif`;
  ctx.fillStyle = '#000000';
  ctx.fillText(ticketData.trainNumber || '', leftPadding, y);
  
  if (ticketData.checkGate) {
    ctx.font = `${20 * scale}px sans-serif`;
    ctx.fillStyle = '#666666';
    const checkText = `检票: ${ticketData.checkGate}`;
    const textWidth = ctx.measureText(ticketData.trainNumber || '').width;
    ctx.fillText(checkText, leftPadding + textWidth + 20 * scale, y);
  }
  
  y += 40 * scale;
  
  // 2. 绘制站点信息
  ctx.font = `bold ${32 * scale}px sans-serif`;
  ctx.fillStyle = '#000000';
  const fromStation = `${ticketData.startStation || ''}站`;
  ctx.fillText(fromStation, leftPadding, y);
  
  // 箭头
  ctx.font = `${24 * scale}px sans-serif`;
  const fromWidth = ctx.measureText(fromStation).width;
  ctx.fillText('→', leftPadding + fromWidth + 20 * scale, y);
  
  // 到站
  const toStation = `${ticketData.endStation || ''}站`;
  ctx.fillText(toStation, leftPadding + fromWidth + 60 * scale, y);
  
  y += 30 * scale;
  
  // 3. 绘制拼音
  ctx.font = `${16 * scale}px sans-serif`;
  ctx.fillStyle = '#999999';
  ctx.fillText(ticketData.fromPinyin || '', leftPadding, y);
  ctx.fillText(ticketData.toPinyin || '', leftPadding + fromWidth + 60 * scale, y);
  
  y += 35 * scale;
  
  // 4. 绘制日期时间
  ctx.font = `${20 * scale}px sans-serif`;
  ctx.fillStyle = '#000000';
  const dateStr = ticketData.departureDate || '';
  const [year, month, day] = dateStr.split(/[-\/]/);
  const timeText = `${year}年${month}月${day}日 ${ticketData.departureTime || ''} 开`;
  ctx.fillText(timeText, leftPadding, y);
  
  y += 30 * scale;
  
  // 5. 绘制座位信息
  ctx.font = `${18 * scale}px sans-serif`;
  ctx.fillStyle = '#333333';
  const seatText = `${ticketData.carriage || ''}车 ${ticketData.seat || ''}`;
  ctx.fillText(seatText, leftPadding, y);
  
  y += 35 * scale;
  
  // 6. 绘制票价和座位类型
  ctx.font = `bold ${24 * scale}px sans-serif`;
  ctx.fillStyle = '#ff6b35';
  const priceText = ticketData.price ? `￥${ticketData.price}` : '';
  ctx.fillText(priceText, leftPadding, y);
  
  ctx.font = `${20 * scale}px sans-serif`;
  ctx.fillStyle = '#000000';
  const priceWidth = ctx.measureText(priceText).width;
  ctx.fillText(ticketData.seatType || '', leftPadding + priceWidth + 30 * scale, y);
  
  y += 35 * scale;
  
  // 7. 绘制提示文字
  ctx.font = `${14 * scale}px sans-serif`;
  ctx.fillStyle = '#999999';
  ctx.fillText('仅供报销使用', leftPadding, y);
  
  y += 30 * scale;
  
  // 8. 绘制乘客信息
  ctx.font = `${18 * scale}px sans-serif`;
  ctx.fillStyle = '#000000';
  const idNumber = ticketData.idNumber || '';
  const maskedId = idNumber.length > 6 
    ? `${idNumber.slice(0, 3)}****${idNumber.slice(-4)}`
    : idNumber;
  ctx.fillText(maskedId, leftPadding, y);
  
  ctx.fillText(ticketData.name || '', leftPadding + 200 * scale, y);
  
  y += 30 * scale;
  
  // 9. 绘制购票提示
  ctx.font = `${12 * scale}px sans-serif`;
  ctx.fillStyle = '#666666';
  ctx.fillText('买票请到12306发货请到95306', leftPadding, y);
  
  y += 20 * scale;
  ctx.fillStyle = '#ff6b35';
  ctx.fillText('中国铁路祝您旅途愉快', leftPadding, y);
  
  y += 30 * scale;
  
  // 10. 绘制底部信息
  ctx.font = `${14 * scale}px sans-serif`;
  ctx.fillStyle = '#333333';
  ctx.fillText(ticketData.codeNumber || '', leftPadding, y);
  ctx.fillText(ticketData.saleStation || '', leftPadding + 200 * scale, y);
  
  // 绘制完成
  return ctx;
};

/**
 * 将票根数据转换为图片
 * @param {String} canvasId - Canvas元素ID
 * @param {Object} ticketData - 票根数据
 * @param {Object} options - 配置选项
 * @param {Object} context - 组件实例上下文
 * @returns {Promise<String>} 图片临时路径
 */
export const ticketToImage = (canvasId, ticketData, options = {}, context = null) => {
  return new Promise((resolve, reject) => {
    const {
      width = 750,
      height = 400,
      destWidth = 750,
      destHeight = 400,
      fileType = 'png',
      quality = 1
    } = options;
    
    // 查询Canvas的函数，支持重试
    const queryCanvas = (retryCount = 0) => {
      // 创建查询器
      const query = context 
        ? uni.createSelectorQuery().in(context)
        : uni.createSelectorQuery();
      
      // 使用class选择器而不是id（小程序会给id加前缀）
      query.select(`.${canvasId}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          console.log(`Canvas查询结果 (使用class .${canvasId}, 重试${retryCount}次):`, res);
          
          if (!res || !res[0] || !res[0].node) {
            // 如果查询失败且重试次数少于3次，则重试
            if (retryCount < 3) {
              console.log(`Canvas未找到，${300}ms后重试...`);
              setTimeout(() => {
                queryCanvas(retryCount + 1);
              }, 300);
              return;
            }
            
            console.error('Canvas元素未找到，class:', canvasId);
            reject(new Error(`Canvas元素未找到: ${canvasId}`));
            return;
          }
          
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          
          console.log('Canvas元素找到，开始绘制，尺寸:', res[0]);
          
          // 设置canvas尺寸
          const dpr = uni.getSystemInfoSync().pixelRatio || 1;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);
          
          // 绘制票根
          drawTicketToCanvas(ctx, ticketData, width, height);
          
          console.log('绘制完成，等待导出图片...');
          
          // 延迟执行，确保绘制完成
          setTimeout(() => {
            // 导出图片
            uni.canvasToTempFilePath({
              canvas: canvas,
              destWidth: destWidth,
              destHeight: destHeight,
              fileType: fileType,
              quality: quality,
              success: (res) => {
                console.log('生成图片成功:', res.tempFilePath);
                resolve(res.tempFilePath);
              },
              fail: (err) => {
                console.error('生成图片失败:', err);
                reject(new Error('生成图片失败: ' + (err.errMsg || JSON.stringify(err))));
              }
            });
          }, 500);
        });
    };
    
    // 开始查询
    queryCanvas(0);
  });
};

/**
 * 保存票根图片到相册
 * @param {String} canvasId - Canvas元素ID
 * @param {Object} ticketData - 票根数据
 * @param {Object} context - 组件实例上下文
 * @returns {Promise}
 */
export const saveTicketToAlbum = async (canvasId, ticketData, context = null) => {
  try {
    console.log('开始保存票根图片, canvasId:', canvasId);
    
    // 先生成图片
    const tempFilePath = await ticketToImage(canvasId, ticketData, {}, context);
    
    console.log('图片生成成功，准备保存到相册:', tempFilePath);
    
    // 请求保存权限
    try {
      await uni.authorize({
        scope: 'scope.writePhotosAlbum'
      });
    } catch (authError) {
      console.log('需要用户授权保存图片');
      // 如果用户拒绝过，引导用户打开设置
      const modalRes = await uni.showModal({
        title: '提示',
        content: '需要您授权保存图片到相册',
        confirmText: '去设置'
      });
      
      if (modalRes.confirm) {
        await uni.openSetting();
      }
      throw new Error('用户取消授权');
    }
    
    // 保存到相册
    await uni.saveImageToPhotosAlbum({
      filePath: tempFilePath
    });
    
    console.log('保存到相册成功');
    
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    });
    
    return tempFilePath;
  } catch (error) {
    console.error('保存图片失败:', error);
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    });
    throw error;
  }
};