# generateQRCode 云函数

使用微信官方 API 生成小程序码的云函数，支持本地调试和云端运行。

## 功能说明

- 调用 `wxacode.getUnlimited` 生成小程序码
- 自动上传到云存储
- 支持本地调试模式
- 完善的参数验证和错误处理

## 目录结构

```
generateQRCode/
├── index.js           # 主函数文件
├── package.json       # 依赖配置
├── config.json        # 云函数配置
├── .env.example       # 环境变量示例
└── README.md          # 说明文档
```

## 本地调试

### 1. 安装依赖

```bash
cd cloudfunctions/generateQRCode
npm install
```

### 2. 配置环境变量（可选）

```bash
cp .env.example .env
# 编辑 .env 文件，设置 NODE_ENV=development
```

### 3. 运行调试

```bash
node index.js
```

输出示例：
```
========== 本地调试模式 ==========

[入口] 收到请求: {"scene":"id=test123","page":"pages/preview/index","width":280,"envVersion":"develop"}
[环境] 运行环境: 本地调试
[本地调试] 模拟生成小程序码
[本地调试] scene: id=test123
[本地调试] page: pages/preview/index
[本地调试] width: 280

========== 执行结果 ==========

{
  "success": true,
  "fileID": "cloud://mock-env.mock-1234567890.png",
  "cloudPath": "wxacode/mock_1234567890.png",
  "isLocal": true,
  "message": "本地调试模式，返回模拟数据"
}

==============================
```

## 云端部署

### 1. 在微信开发者工具中上传

1. 右键点击 `cloudfunctions/generateQRCode` 文件夹
2. 选择"上传并部署：云端安装依赖"
3. 等待部署完成

### 2. 配置权限

在云开发控制台 -> 设置 -> 权限设置中：
- 开通 `wxacode.getUnlimited` 接口权限

## 调用方法

### 前端调用

```javascript
const result = await uni.cloud.callFunction({
  name: 'generateQRCode',
  data: {
    scene: 'id=123456',           // 必填，最多32个字符
    page: 'pages/preview/index',  // 可选，默认为 pages/preview/index
    width: 280,                   // 可选，默认为 280
    envVersion: 'develop'         // 可选，develop/trial/release
  }
});

if (result.result.success) {
  const fileID = result.result.fileID;
  console.log('小程序码生成成功:', fileID);
} else {
  console.error('生成失败:', result.result.error);
}
```

## 参数说明

### scene（必填）
- 类型：`string`
- 长度：最多32个可见字符
- 说明：小程序码携带的参数
- 示例：`id=123456` 或 `ticketId=abc123`

### page（可选）
- 类型：`string`
- 默认：`pages/preview/index`
- 说明：跳转的小程序页面路径
- 要求：必须是已发布的小程序页面

### width（可选）
- 类型：`number`
- 范围：280 ~ 1280
- 默认：280
- 说明：小程序码宽度（单位：px）

### envVersion（可选）
- 类型：`string`
- 可选值：`develop`（开发版）、`trial`（体验版）、`release`（正式版）
- 默认：`develop`
- 说明：要打开的小程序版本

## 返回值

### 成功响应
```javascript
{
  success: true,
  fileID: 'cloud://xxx.png',
  cloudPath: 'wxacode/1234567890_abc.png'
}
```

### 失败响应
```javascript
{
  success: false,
  error: '错误信息',
  errCode: '错误码'
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| `INVALID_PARAMS` | 参数验证失败 |
| `41030` | page 不存在 |
| `45009` | 接口调用超过限制 |
| `47001` | POST 数据格式错误 |
| `40001` | access_token 过期 |

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | - |
| `DEBUG` | 调试模式 | false |

## 注意事项

1. **scene 长度限制**：最多32个可见字符，建议使用短 ID
2. **页面路径**：page 参数必须在 app.json 中声明
3. **环境版本**：开发版小程序码只能在开发版小程序中使用
4. **本地调试**：本地调试模式返回模拟数据，不会真正生成小程序码
5. **权限配置**：需要在云开发控制台开通 openapi 权限

## 开发建议

1. 本地开发时使用 `NODE_ENV=development` 进行调试
2. 部署前检查参数验证逻辑
3. 生产环境将 `envVersion` 改为 `release`
4. 添加日志记录便于追踪问题
5. 考虑添加缓存机制避免重复生成
