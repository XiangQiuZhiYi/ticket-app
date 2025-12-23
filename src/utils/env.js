// 小程序环境检测工具

// 小程序环境检测工具

/**
 * 获取当前小程序的运行环境
 * @returns {string} 'develop' | 'trial' | 'release'
 */
export const getMiniProgramEnv = () => {
  let envVersion = 'release'; // 默认正式版
  
  try {
    // 微信小程序环境检测
    // #ifdef MP-WEIXIN
    if (typeof wx !== 'undefined' && wx.getAccountInfoSync) {
      try {
        const accountInfo = wx.getAccountInfoSync();
        if (accountInfo?.miniProgram?.envVersion) {
          envVersion = accountInfo.miniProgram.envVersion;
          console.log('✅ 微信小程序环境检测成功:', envVersion);
          return envVersion;
        }
      } catch (e) {
        console.warn('微信小程序环境API调用失败:', e);
      }
    }
    // #endif
    
    // 备用方案：根据构建环境判断
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === 'development') {
      envVersion = 'develop';
      console.log('⚙️ 根据NODE_ENV判断为开发环境:', nodeEnv);
    } else if (nodeEnv === 'test') {
      envVersion = 'trial';
      console.log('⚙️ 根据NODE_ENV判断为测试环境:', nodeEnv);
    } else {
      envVersion = 'release';
      console.log('⚙️ 默认使用正式环境或根据NODE_ENV判断:', nodeEnv);
    }
    
    // H5环境额外检测
    // #ifdef H5
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      if (hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('.local')) {
        envVersion = 'develop';
        console.log('🌐 H5本地开发环境检测:', hostname);
      } else if (hostname.includes('test') || hostname.includes('staging') || hostname.includes('dev')) {
        envVersion = 'trial';
        console.log('🌐 H5测试环境检测:', hostname);
      }
    }
    // #endif
    
  } catch (error) {
    console.error('环境检测异常，使用默认正式版:', error);
    envVersion = 'release';
  }
  
  console.log('🎯 最终环境判断结果:', envVersion);
  return envVersion;
};

/**
 * 获取小程序码生成参数
 * @param {Object} params - 生成参数
 * @param {string} params.scene - 场景值
 * @param {string} params.page - 页面路径  
 * @param {number} params.width - 宽度
 * @param {string} params.envVersion - 强制指定环境版本
 * @returns {Object} 完整的生成参数
 */
export const getQRCodeParams = (params) => {
  const {
    scene,
    page = 'pages/preview/index',
    width = 280,
    envVersion
  } = params;
  
  // 如果没有指定环境版本，自动检测
  const finalEnvVersion = envVersion || getMiniProgramEnv();
  
  console.log('📋 小程序码生成参数:', {
    scene,
    page, 
    width,
    envVersion: finalEnvVersion
  });
  
  return {
    scene,
    page,
    width,
    envVersion: finalEnvVersion
  };
};

/**
 * 获取环境描述
 * @param {string} envVersion 
 * @returns {string}
 */
export const getEnvDescription = (envVersion) => {
  const envMap = {
    'develop': '开发版',
    'trial': '体验版',
    'release': '正式版'
  };
  
  return envMap[envVersion] || '未知版本';
};

/**
 * 检查是否为生产环境
 * @returns {boolean}
 */
export const isProductionEnv = () => {
  return getMiniProgramEnv() === 'release';
};

/**
 * 检查是否为开发环境
 * @returns {boolean}
 */
export const isDevelopEnv = () => {
  return getMiniProgramEnv() === 'develop';
};