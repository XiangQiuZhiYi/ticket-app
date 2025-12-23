// 生成小程序码功能
const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async (event, context) => {
  try {
    const {
      scene,
      page = "pages/preview/index",
      width = 280,
      envVersion,
    } = event;

    // 参数验证
    if (!scene) {
      return {
        success: false,
        error: "缺少 scene 参数",
        errCode: "INVALID_PARAMS",
      };
    }

    if (scene.length > 32) {
      return {
        success: false,
        error: "scene 参数长度超过32个字符",
        errCode: "INVALID_PARAMS",
      };
    }

    // 智能判断环境版本
    let targetEnvVersion = envVersion;
    
    if (!targetEnvVersion) {
      // 如果没有指定版本，根据云环境自动判断
      const currentEnv = cloud.DYNAMIC_CURRENT_ENV || '';
      
      // 根据环境名称判断
      if (currentEnv.includes('prod') || currentEnv.includes('release') || currentEnv.includes('online')) {
        targetEnvVersion = "release";
      } else if (currentEnv.includes('test') || currentEnv.includes('trial') || currentEnv.includes('staging')) {
        targetEnvVersion = "trial";
      } else {
        targetEnvVersion = "develop";
      }
      
      console.log('云环境自动判断版本:', currentEnv, '->', targetEnvVersion);
    }

    console.log('生成小程序码参数:', {
      scene,
      page,
      envVersion: targetEnvVersion,
      width,
      cloudEnv: cloud.DYNAMIC_CURRENT_ENV
    });

    // 调用微信官方 API 生成小程序码
    const result = await cloud.openapi.wxacode.getUnlimited({
      scene: scene,
      page: page,
      checkPath: false,
      envVersion: targetEnvVersion,
      width: width,
    });

    if (!result || !result.buffer) {
      throw new Error("生成小程序码失败，未返回图片数据");
    }

    // 上传到云存储
    const cloudPath = `wxacode/${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.png`;

    const uploadResult = await cloud.uploadFile({
      cloudPath: cloudPath,
      fileContent: result.buffer,
    });

    return {
      success: true,
      fileID: uploadResult.fileID,
      cloudPath: cloudPath,
      scene: scene,
      envVersion: targetEnvVersion,
      message: `小程序码生成成功 (${targetEnvVersion}版本)`
    };
  } catch (error) {
    console.error("[生成小程序码错误]", {
      error: error.message,
      scene: event.scene,
      envVersion: event.envVersion,
      cloudEnv: cloud.DYNAMIC_CURRENT_ENV
    });

    return {
      success: false,
      error: error.message || "未知错误",
      errCode: error.errCode || "UNKNOWN_ERROR",
    };
  }
};
