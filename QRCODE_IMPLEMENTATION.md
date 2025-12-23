# 小程序码生成功能实现

## 功能说明

当用户添加票根成功后，系统会自动：
1. 调用云函数，使用微信官方 `wxacode.getUnlimited` API 生成小程序码
2. 将小程序码上传到云存储
3. 更新票根数据，保存小程序码 URL

## 技术方案

### 使用微信官方 API
- 调用 `cloud.openapi.wxacode.getUnlimited` 生成小程序码
- 无数量限制（相比 createQRCode 和 get 接口）
- 支持传入 scene 参数（最多32个可见字符）
- 自动上传到云存储

## 文件说明

### 1. 云函数：`cloudfunctions/generateQRCode/`
- **index.js**: 使用微信官方 API 生成小程序码
- **package.json**: 只需要 `wx-server-sdk` 依赖
- **config.json**: 云函数配置文件

### 2. API 更新：`src/api/tickets/index.js`
- 使用已有的 `updateTicket()` 方法更新票根数据

### 3. 页面更新：`src/pages/create/index.vue`
- 添加票根成功后调用云函数生成小程序码

## 部署步骤

### 1. 开通云开发权限
确保在微信开发者工具中开通了云开发功能。

### 2. 上传云函数
```bash
# 在微信开发者工具中
右键点击 cloudfunctions/generateQRCode 文件夹 
-> 上传并部署：云端安装依赖
```

### 3. 配置云函数权限
在云开发控制台 -> 设置 -> 权限设置中，确保云函数有权限调用 `wxacode.getUnlimited` 接口。

### 4. 数据库字段
票根数据会新增字段：
- `wxacodeUrl`: 小程序码图片的云存储地址
- `previewPage`: 预览页面路径

## 使用流程

1. 用户填写票根信息并提交
2. 系统保存票根数据到数据库，返回票根 ID
3. 调用云函数 `generateQRCode`，传入参数：
   - `scene`: `id={票根ID}`（最多32个字符）
   - `page`: `pages/preview/index`
   - `width`: 280（小程序码宽度）
4. 云函数调用微信官方 API 生成小程序码
5. 云函数将小程序码上传到云存储，返回 fileID
6. 更新票根数据，保存小程序码 URL
7. 提示用户创建成功

## 参数说明

### scene（必填）
- 小程序码携带的参数，最多32个可见字符
- 格式示例：`id=123456` 或 `ticketId=abc123`
- 在预览页面通过 `onLoad(options)` 获取参数

### page（可选）
- 跳转的页面路径，必须是已发布的小程序页面
- 默认：`pages/preview/index`
- 必须在 `app.json` 的 pages 中声明

### width（可选）
- 小程序码宽度，单位 px
- 范围：280px ~ 1280px
- 默认：280

### envVersion（可选）
- 要打开的小程序版本
- `release`: 正式版
- `trial`: 体验版
- `develop`: 开发版（默认）

## 预览页面集成

`pages/preview/index.vue` 需要：

```javascript
onLoad(options) {
  // 从 scene 参数中获取票根 ID
  const scene = decodeURIComponent(options.scene || '');
  const params = {};
  
  scene.split('&').forEach(item => {
    const [key, value] = item.split('=');
    if (key && value) params[key] = value;
  });
  
  const ticketId = params.id;
  // 根据 ID 加载票根数据
  loadTicket(ticketId);
}
```

## 错误处理

- 如果小程序码生成失败，不影响票根创建
- 常见错误码：
  - `41030`: page 不存在
  - `45009`: 接口调用超过限制（无限制版本不会出现）
  - `47001`: POST 数据格式错误
  - `40001`: access_token 过期

## 优势

✅ **官方 API** - 稳定可靠，微信官方支持
✅ **无数量限制** - getUnlimited 接口无生成数量限制
✅ **参数传递** - 支持通过 scene 传递自定义参数
✅ **自动跳转** - 扫码自动跳转到指定小程序页面
✅ **美观** - 微信标准小程序码样式

## 注意事项

1. **scene 长度限制**: 最多32个可见字符，需要精简参数
2. **页面路径**: page 参数必须是已发布的小程序页面
3. **云函数权限**: 需要在云开发控制台开通 openapi 调用权限
4. **开发环境**: 开发版小程序码只能在开发版小程序中使用
5. **发布前**: 正式发布前将 `envVersion` 改为 `release`

## 后续优化建议

1. 支持自定义小程序码颜色
2. 添加小程序码下载功能
3. 统计小程序码扫描次数
4. 支持批量生成小程序码
5. 缓存机制，避免重复生成

