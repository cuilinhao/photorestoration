# Photo Restoration - AI 黑白照片着色工具

一个基于 Next.js 15 和 AI 技术的老照片着色 Web 应用，让您的黑白历史照片瞬间重焕色彩！

## ✨ 核心功能

- **🎨 智能着色**：基于 AI 算法自动为黑白照片添加自然色彩
- **⚡ 快速处理**：60 秒内完成着色处理
- **🖼️ 高清输出**：支持高分辨率图片输出，保持原图质量
- **📱 响应式设计**：完美适配桌面和移动设备
- **🔧 拖拽上传**：支持拖拽和点击上传，操作简便
- **👁️ 实时对比**：滑动对比查看着色前后效果
- **💾 一键下载**：处理完成后可直接下载高清彩色照片

## 🛠️ 技术栈

### 前端技术
- **Next.js 15** - React 全栈框架（App Router）
- **TypeScript** - 类型安全开发
- **Tailwind CSS** - 原子化 CSS 框架
- **Shadcn/ui** - 现代化 UI 组件库

### 核心依赖
- **react-compare-image** - 图片对比滑块
- **react-dropzone** - 文件拖拽上传
- **sonner** - 优雅的消息提示
- **lucide-react** - 现代图标库

### AI 服务（计划中）
- **Replicate API** - AI 图像处理服务
- **Supabase Storage** - 云端图片存储

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm/yarn/pnpm/bun

### 安装步骤

```bash
# 克隆项目
git clone <your-repo-url>
cd photo-restoration

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 访问应用
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
photo-restoration/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # 首页
│   │   ├── layout.tsx         # 根布局
│   │   └── ClientBody.tsx      # 客户端包装组件
│   ├── components/             # React 组件
│   │   ├── HeroSlider.tsx     # 首页展示滑块
│   │   ├── UploadZone.tsx     # 文件上传区域
│   │   ├── ResultSlider.tsx   # 结果对比滑块
│   │   ├── Loader.tsx         # 加载动画组件
│   │   └── ui/                # 基础 UI 组件
│   └── lib/                   # 工具函数
│       ├── replicate.ts       # AI 服务接口（Mock）
│       ├── supabase.ts        # 存储服务接口（Mock）
│       └── utils.ts           # 通用工具函数
├── public/
│   └── demo/                  # 演示图片
│       ├── old_photo_bw.jpg   # 黑白演示图
│       └── old_photo_color.jpg # 彩色演示图
└── 配置文件...
```

## 🎯 使用方法

1. **访问应用**：在浏览器中打开应用
2. **查看演示**：首页滑块展示着色效果
3. **上传照片**：点击"立即尝试"，拖拽或选择黑白照片
4. **等待处理**：AI 将在约 60 秒内完成着色
5. **查看结果**：使用滑块对比着色前后效果
6. **下载保存**：点击下载按钮保存高清彩色照片

### 支持格式
- **文件类型**：JPG、JPEG、PNG
- **文件大小**：最大 8MB
- **输出格式**：高清 JPG

## ⚙️ 开发命令

```bash
npm run dev       # 启动开发服务器
npm run build     # 构建生产版本
npm run start     # 启动生产服务器
npm run lint      # 代码检查和格式化
npm run format    # 代码格式化
```

## 🔧 配置说明

### 环境变量（待配置）
```env
# Replicate API（AI 服务）
REPLICATE_API_TOKEN=your_replicate_token

# Supabase（存储服务）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 当前状态
- ✅ **前端 UI** - 完整实现
- ✅ **响应式设计** - 完美适配
- ✅ **文件上传** - 支持验证和预览
- ✅ **结果展示** - 滑块对比功能
- 🚧 **AI 服务** - 使用 Mock 数据
- 🚧 **云存储** - 使用本地 Blob URL
- 🚧 **生产部署** - 待配置真实服务

## 🎨 设计特色

- **紫色主题**：现代化的紫色渐变设计
- **流畅动画**：平滑的状态转换和加载动画
- **直观交互**：清晰的操作流程和即时反馈
- **移动优先**：响应式设计，移动端体验优良

## 🔮 后续计划

- [ ] 集成真实 AI 着色服务（Replicate）
- [ ] 配置云存储服务（Supabase）
- [ ] 添加批量处理功能
- [ ] 支持更多图片格式
- [ ] 优化处理速度和效果
- [ ] 添加用户账户系统
- [ ] 提供多种着色风格选择
- [ ] 添加图片历史记录
- [ ] 支持图片分享功能

## 🚨 已知问题

目前使用 Mock 数据进行演示：
- AI 着色功能返回固定的演示图片
- 文件上传使用本地 Blob URL
- 处理时间为模拟延迟

## 🧪 开发注意事项

### 代码规范
- 使用 **Biome** 进行代码检查和格式化
- 严格的 **TypeScript** 类型检查
- 遵循 **React** 最佳实践

### 构建优化
- 使用 **React Server Components** 优化性能
- 最小化客户端 JavaScript
- 响应式图片和懒加载

## 📄 许可证

MIT License

---

**让珍贵的黑白回忆重新焕发色彩！** 🌈✨

> 这是一个演示项目，展示了现代 Web 技术在 AI 图像处理领域的应用。适合学习 Next.js 15、TypeScript 和现代前端开发最佳实践。
