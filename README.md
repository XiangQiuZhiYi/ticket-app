# 票根生成器 (uni-app + Vite 版本)

这是一个使用 uni-app + Vite 构建的火车票票根生成器小程序，支持微信小程序平台。

## 项目概述

本项目是一个火车票票根生成器，用户可以创建、查看和管理自己的火车票票根。项目包含以下功能：

- 首页选择票根类型
- 创建新的火车票票根
- 瀑布流展示所有票根
- 查看票根详情
- 票根预览功能

## 技术栈

- **框架**: uni-app (Vue 3 + Composition API)
- **构建工具**: Vite
- **样式预处理器**: SCSS
- **状态管理**: Pinia
- **路由**: uni-app 内置页面路由

## 项目结构

```
src/
├── pages/                    # 页面文件
│   ├── index/               # 首页
│   ├── create/              # 创建票根页
│   ├── waterfall/           # 瀑布流展示页
│   └── detail/              # 详情页
├── components/              # 公共组件
│   └── TicketPreview/       # 票根预览组件
├── stores/                  # 状态管理
├── utils/                   # 工具函数
├── styles/                  # 全局样式
└── static/                  # 静态资源
```

## 开发环境

### 安装依赖

```bash
npm install
```

### 启动微信小程序开发环境

```bash
npm run dev:mp-weixin
```

### 构建微信小程序生产版本

```bash
npm run build:mp-weixin
```

## 功能说明

### 1. 首页 (pages/index)
- 展示票根类型选择界面
- 点击"火车票"按钮进入票根列表页面

### 2. 创建票根 (pages/create)
- 提供表单用于输入火车票信息
- 实时预览生成的票根
- 提交后返回票根列表页面

### 3. 票根列表 (pages/waterfall)
- 瀑布流展示所有已创建的票根
- 点击"+"按钮可创建新的票根
- 点击任意票根可查看详细信息

### 4. 票根详情 (pages/detail)
- 展示票根的完整信息
- 提供下载、编辑、删除功能（示例）
- 显示票根描述信息

## 组件说明

### TicketPreview 组件
- 用于展示火车票票根的预览效果
- 支持自定义票根数据
- 样式模拟真实火车票设计

## 配置文件

### manifest.json
- 小程序配置文件
- 包含基础配置和微信小程序特定配置

### pages.json
- 页面路由配置
- 全局样式设置
- TabBar 配置

### vite.config.js
- Vite 构建配置
- SCSS 预处理器配置
- 路径别名配置

## 注意事项

1. 项目使用 SCSS 作为样式预处理器，请确保已安装相关依赖
2. 微信小程序开发需要安装微信开发者工具
3. 项目中的数据为模拟数据，实际使用时需要连接后端接口
4. 所有页面和组件都遵循 uni-app 的开发规范

## 项目迁移说明

本项目是从 Taro 框架迁移而来的 uni-app 项目，主要变化包括：

1. **框架迁移**: React → Vue 3 Composition API
2. **API 调用**: Taro API → uni API
3. **状态管理**: React useState/useEffect → Vue ref/onMounted
4. **构建工具**: Taro 构建 → Vite 构建
5. **样式处理**: 保持原有的 SCSS 样式文件结构

## 许可证

MIT# ticket-app
