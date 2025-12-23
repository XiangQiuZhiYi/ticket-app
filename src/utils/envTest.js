// 环境检测测试工具
import { getMiniProgramEnv, getQRCodeParams, getEnvDescription } from './env.js';

/**
 * 测试环境检测功能
 */
export const testEnvironmentDetection = () => {
  console.log('🧪 开始环境检测测试...');
  
  try {
    // 测试基本环境检测
    const detectedEnv = getMiniProgramEnv();
    console.log('检测到的环境:', detectedEnv);
    console.log('环境描述:', getEnvDescription(detectedEnv));
    
    // 测试不同场景下的参数生成
    const scenarios = [
      { scene: 'abc12345', desc: '普通场景' },
      { scene: 'test123', desc: '测试场景' },
      { scene: '短ID测试', desc: '中文场景', envVersion: 'develop' }
    ];
    
    scenarios.forEach(scenario => {
      const params = getQRCodeParams({
        scene: scenario.scene,
        envVersion: scenario.envVersion
      });
      
      console.log(`${scenario.desc}参数:`, params);
    });
    
    // 检测运行环境详细信息
    const envInfo = {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      platform: '',
      nodeEnv: process.env.NODE_ENV,
      // #ifdef MP-WEIXIN
      wxInfo: 'WeChat Mini Program'
      // #endif
      // #ifdef H5
      , h5Info: typeof window !== 'undefined' ? window.location.href : 'N/A'
      // #endif
    };
    
    try {
      const sysInfo = uni.getSystemInfoSync();
      envInfo.platform = sysInfo.platform;
      envInfo.version = sysInfo.version;
    } catch (e) {
      console.log('获取系统信息失败');
    }
    
    console.log('🔍 运行环境信息:', envInfo);
    
    // 在控制台显示总结
    const summary = `
🧪 环境检测测试结果
━━━━━━━━━━━━━━━━━━
📱 检测环境: ${getEnvDescription(detectedEnv)} (${detectedEnv})
🏗️ 构建环境: ${process.env.NODE_ENV || '未知'}
🖥️ 运行平台: ${envInfo.platform || '未知'}
━━━━━━━━━━━━━━━━━━
    `;
    
    console.log(summary);
    
    // 显示测试结果对话框
    uni.showModal({
      title: '环境检测测试',
      content: `检测环境: ${getEnvDescription(detectedEnv)}\n构建环境: ${process.env.NODE_ENV || '未知'}\n运行平台: ${envInfo.platform || '未知'}`,
      showCancel: false,
      confirmText: '知道了'
    });
    
    return {
      success: true,
      detectedEnv,
      envInfo
    };
    
  } catch (error) {
    console.error('❌ 环境检测测试失败:', error);
    
    uni.showToast({
      title: '测试失败: ' + error.message,
      icon: 'none',
      duration: 3000
    });
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 快速环境检查（用于调试）
 */
export const quickEnvCheck = () => {
  const env = getMiniProgramEnv();
  console.log(`🎯 当前环境: ${env} (${getEnvDescription(env)})`);
  return env;
};

/**
 * 验证小程序API可用性
 */
export const checkMiniProgramAPIs = () => {
  const apiStatus = {};
  
  // #ifdef MP-WEIXIN
  // 检查微信小程序API
  apiStatus.wx = typeof wx !== 'undefined';
  apiStatus.wxGetAccountInfoSync = typeof wx !== 'undefined' && typeof wx.getAccountInfoSync === 'function';
  
  if (apiStatus.wxGetAccountInfoSync) {
    try {
      const accountInfo = wx.getAccountInfoSync();
      apiStatus.accountInfo = !!accountInfo;
      apiStatus.miniProgramInfo = !!(accountInfo && accountInfo.miniProgram);
      apiStatus.envVersion = accountInfo?.miniProgram?.envVersion || null;
    } catch (e) {
      apiStatus.accountInfoError = e.message;
    }
  }
  // #endif
  
  // 检查uni-app API
  apiStatus.uni = typeof uni !== 'undefined';
  apiStatus.uniCloud = typeof uni !== 'undefined' && typeof uni.cloud !== 'undefined';
  
  console.log('📋 API可用性检查:', apiStatus);
  return apiStatus;
};