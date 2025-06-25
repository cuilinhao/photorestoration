# ColorOld - AI 老照片上色工具

一个基于 Next.js 和 AI 技术的老照片上色 Web 应用，60 秒内让您的黑白老照片重新焕发色彩！

## ✨ 功能特性
//ssss
- **智能上色**：使用先进的 AI 算法为黑白/褪色照片添加自然色彩
- **快速处理**：承诺 60 秒内完成上色处理
- **高清输出**：支持 2K 分辨率输出，保持照片清晰度
- **拖拽上传**：支持拖拽和点击上传，操作简便
- **实时对比**：可拖拽的前后对比滑块，直观展示上色效果
- **一键下载**：处理完成后可直接下载高清彩色照片

## 🛠 技术栈

### 前端框架
- **Next.js 15** - React 全栈框架
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 原子化 CSS 框架
- **Shadcn UI** - 现代化 UI 组件库

### 核心依赖
- **react-compare-image** - 图片对比滑块组件
- **react-dropzone** - 文件拖拽上传
- **lucide-react** - 现代图标库
- **sonner** - 优雅的消息提示

### 后端服务
- **Replicate API** - AI 图像处理服务
- **Supabase Storage** - 云端图片存储

## 📦 安装与运行

### 环境要求
- Node.js 18+ 或 Bun
- 现代浏览器支持

### 快速开始

1. **克隆项目**
```bash
git clone <repository-url>
cd colorold
```

2. **安装依赖**
```bash
bun install
# 或使用 npm
npm install
```

3. **启动开发服务器**
```bash
bun dev
# 或使用 npm
npm run dev
```

4. **打开浏览器**
访问 [http://localhost:3000](http://localhost:3000) 查看应用

### 可用脚本

```bash
bun dev          # 启动开发服务器
bun build        # 构建生产版本
bun start        # 启动生产服务器
bun lint         # 代码检查和格式化
bun format       # 代码格式化
```

## 🎯 使用方法

1. **上传照片**：拖拽或点击上传您的黑白/褪色老照片
2. **等待处理**：AI 将在 60 秒内完成上色处理
3. **查看效果**：使用滑块对比上色前后的效果
4. **下载保存**：满意后点击下载高清彩色照片

### 支持格式
- **文件类型**：JPG, JPEG, PNG
- **文件大小**：最大 8MB
- **输出格式**：高清 JPG

## 🏗 项目结构

```
colorold/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx         # 首页
│   │   └── layout.tsx       # 根布局
│   ├── components/          # React 组件
│   │   ├── HeroSlider.tsx   # 首页展示组件
│   │   ├── UploadZone.tsx   # 文件上传组件
│   │   ├── ResultSlider.tsx # 结果对比组件
│   │   └── ui/              # UI 基础组件
│   └── lib/                 # 工具函数
│       ├── replicate.ts     # AI 服务接口
│       └── supabase.ts      # 存储服务接口
├── public/
│   └── demo/                # 演示图片
└── 配置文件...
```

## 🔧 配置说明

### 环境变量
```env
# Replicate API（AI 服务）
REPLICATE_API_TOKEN=your_replicate_token

# Supabase（存储服务）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 当前状态
- ✅ 前端 UI 完成
- 🚧 后端服务使用 Mock 数据（开发中）
- 🚧 Replicate AI 服务集成（待配置）
- 🚧 Supabase 存储服务（待配置）

## 🎨 设计特色

- **现代化 UI**：采用紫色主题色，简洁优雅
- **响应式设计**：完美适配桌面端和移动端
- **流畅动画**：平滑的交互动画和状态转换
- **用户体验**：直观的操作流程和反馈

## 🔜 后续计划

- [ ] 集成真实的 AI 上色服务
- [ ] 添加批量处理功能
- [ ] 支持更多图片格式
- [ ] 优化处理速度
- [ ] 添加用户账户系统
- [ ] 提供上色风格选择

## 📝 开发说明

项目使用 Biome 进行代码检查和格式化，遵循严格的 TypeScript 类型检查。

运行检查：
```bash
bun lint    # 代码检查
bun format  # 代码格式化
```

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

**让珍贵的回忆重新焕发光彩！** ✨
