// 小程序码调试工具
import { getMiniProgramEnv, getQRCodeParams, getEnvDescription } from './env.js';
import { getTicketByShortId } from '../api/tickets/index.js';

/**
 * 测试小程序码生成功能
 * @param {string} testScene - 测试场景值
 */
export const testQRCodeGeneration = async (testScene = 'test123') => {
  try {
    console.log('🔍 开始测试小程序码生成...');
    
    // 获取当前环境信息
    const currentEnv = getMiniProgramEnv();
    console.log(`📱 当前小程序环境: ${getEnvDescription(currentEnv)} (${currentEnv})`);
    
    // 生成测试参数
    const params = getQRCodeParams({
      scene: testScene,
      page: 'pages/preview/index',
      width: 280
    });
    
    console.log('🔧 生成参数:', params);
    
    // 调用云函数
    const result = await uni.cloud.callFunction({
      name: 'generateQRCode',
      data: params
    });
    
    if (result.result && result.result.success) {
      console.log('✅ 小程序码生成成功:', {
        fileID: result.result.fileID,
        envVersion: result.result.envVersion,
        message: result.result.message
      });
      
      // 显示成功提示
      uni.showModal({
        title: '测试成功',
        content: `小程序码生成成功！\n环境: ${getEnvDescription(result.result.envVersion)}\n场景值: ${testScene}`,
        showCancel: false
      });
      
      return result.result;
    } else {
      throw new Error(result.result?.error || '生成失败');
    }
    
  } catch (error) {
    console.error('❌ 小程序码生成测试失败:', error);
    
    uni.showModal({
      title: '测试失败',
      content: `生成小程序码失败：${error.message}`,
      showCancel: false
    });
    
    throw error;
  }
};

/**
 * 检查小程序码是否有效
 * @param {string} scene - 场景值
 */
export const validateQRCodeScene = async (scene) => {
  try {
    console.log('🔍 验证场景值:', scene);
    
    // 检查数据库中是否存在对应的票根
    const result = await getTicketByShortId(scene);
    
    if (result && result.data && result.data.length > 0) {
      console.log('✅ 场景值有效，找到对应票根');
      return true;
    } else {
      console.log('❌ 场景值无效，未找到对应票根');
      return false;
    }
  } catch (error) {
    console.error('验证场景值失败:', error);
    return false;
  }
};

/**
 * 显示环境信息调试面板
 */
export const showDebugInfo = () => {
  try {
    const env = getMiniProgramEnv();
    let systemInfo = '';
    
    try {
      const info = uni.getSystemInfoSync();
      systemInfo = `系统: ${info.platform}\n版本: ${info.version}`;
    } catch (e) {
      systemInfo = '获取系统信息失败';
    }
    
    const debugInfo = `
🔍 调试信息

📱 小程序环境: ${getEnvDescription(env)} (${env})
${systemInfo}
🌐 用户代理: ${typeof navigator !== 'undefined' ? navigator.userAgent : '未知'}
📦 构建环境: ${process.env.NODE_ENV || '未知'}
    `.trim();
    
    uni.showModal({
      title: '调试信息',
      content: debugInfo,
      showCancel: false
    });
    
    console.log(debugInfo);
    
  } catch (error) {
    console.error('显示调试信息失败:', error);
  }
};