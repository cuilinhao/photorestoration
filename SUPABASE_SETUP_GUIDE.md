# 🚀 Supabase 项目重建指南

## 📋 概述
这个指南将帮你重新创建一个完整的 Supabase 项目，用于照片修复应用。

---

## 🔧 第一步：创建新的 Supabase 项目

### 1. 访问 Supabase
- 打开 [https://supabase.com](https://supabase.com)
- 点击 "Start your project"
- 使用 GitHub/Google 账号登录或创建新账号

### 2. 创建新项目
- 点击 "New Project"
- 选择组织（或创建新组织）
- 填写项目信息：
  ```
  Name: photo-restoration-app
  Database Password: [设置一个强密码]
  Region: [选择离你最近的区域]
  ```
- 点击 "Create new project"
- 等待项目创建完成（通常需要 1-2 分钟）

---

## 🗄️ 第二步：设置数据库

### 1. 执行主要 SQL 脚本
- 在 Supabase Dashboard 中，点击左侧菜单的 "SQL Editor"
- 点击 "New query"
- 复制 `supabase-setup.sql` 文件的内容并粘贴
- 点击 "Run" 执行脚本

### 2. 验证数据库设置
执行以下查询来验证表是否创建成功：
```sql
-- 检查表是否创建
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'usage_records', 'uploaded_files');

-- 检查 RLS 策略
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

## 📁 第三步：设置存储桶

### 1. 手动创建存储桶
- 在 Supabase Dashboard 中，点击左侧菜单的 "Storage"
- 点击 "Create a new bucket"
- 设置参数：
  ```
  Name: photo-restoration-images
  Public bucket: ✅ (勾选)
  File size limit: 50 MB
  Allowed MIME types: image/*
  ```
- 点击 "Save"

### 2. 设置存储策略
- 在 SQL Editor 中执行 `supabase-storage-setup.sql` 脚本
- 或者手动在 Storage > Policies 中设置策略

### 3. 验证存储设置
```sql
-- 检查存储桶
SELECT id, name, public FROM storage.buckets;

-- 检查存储策略
SELECT policyname, cmd FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
```

---

## 🔑 第四步：获取 API 密钥

### 1. 获取项目信息
- 在 Supabase Dashboard 中，点击左侧菜单的 "Settings"
- 点击 "API"
- 复制以下信息：
  ```
  Project URL: https://your-project-id.supabase.co
  anon public key: eyJ...
  service_role key: eyJ... (保密，不要暴露给前端)
  ```

### 2. 更新环境变量
在你的项目根目录的 `.env.local` 文件中更新：
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key_here
SUPABASE_STORAGE_BUCKET=photo-restoration-images
```

---

## 🔐 第五步：配置认证设置

### 1. 禁用邮箱确认（可选）
- 在 Supabase Dashboard 中，点击 "Authentication"
- 点击 "Settings"
- 在 "User Signups" 部分：
  - 取消勾选 "Enable email confirmations"
  - 这样用户注册后可以立即登录

### 2. 配置认证提供商（可选）
如果需要第三方登录：
- 在 "Authentication" > "Providers" 中
- 配置 Google、GitHub 等提供商

---

## 🧪 第六步：测试设置

### 1. 运行项目诊断
```bash
# 启动开发服务器
npm run dev

# 访问诊断页面
http://localhost:3000/debug-config
```

### 2. 测试功能
- 用户注册/登录
- 文件上传
- 数据库连接

### 3. 检查日志
在 Supabase Dashboard 的 "Logs" 部分查看：
- API 请求日志
- 数据库日志
- 存储日志

---

## 📊 第七步：数据迁移（如果有旧数据）

### 1. 导出旧数据
如果你能访问旧的 Supabase 项目：
```bash
# 导出用户数据
pg_dump -h db.old-project.supabase.co -U postgres -t auth.users -t public.profiles > old_data.sql
```

### 2. 导入数据
```sql
-- 在新项目中导入数据
-- 注意：需要处理 UUID 冲突和外键约束
```

---

## ⚙️ 第八步：优化设置

### 1. 设置数据库备份
- 在 "Settings" > "Database" 中
- 启用自动备份

### 2. 配置监控
- 设置使用量警报
- 配置错误通知

### 3. 性能优化
```sql
-- 创建额外的索引（如果需要）
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_records_created_at ON public.usage_records(created_at);
```

---

## 🔍 故障排除

### 常见问题

1. **RLS 策略问题**
   ```sql
   -- 临时禁用 RLS 进行测试
   ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
   ```

2. **存储上传失败**
   - 检查存储桶是否设置为 public
   - 验证存储策略是否正确
   - 检查文件大小和类型限制

3. **认证问题**
   - 确认 API 密钥正确
   - 检查邮箱确认设置
   - 查看认证日志

### 调试命令
```sql
-- 查看所有表
\dt public.*

-- 查看所有策略
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- 查看存储桶
SELECT * FROM storage.buckets;

-- 测试认证
SELECT auth.uid(), auth.role();
```

---

## 📝 完成检查清单

- [ ] Supabase 项目创建成功
- [ ] 数据库表创建完成
- [ ] RLS 策略设置正确
- [ ] 存储桶创建并配置
- [ ] 存储策略设置完成
- [ ] API 密钥获取并更新到 .env.local
- [ ] 认证设置配置完成
- [ ] 项目诊断测试通过
- [ ] 用户注册/登录测试成功
- [ ] 文件上传测试成功

---

## 🎉 完成！

你的新 Supabase 项目现在已经准备就绪！

### 下一步
1. 测试所有功能
2. 部署到生产环境
3. 监控使用情况
4. 根据需要调整配置

如果遇到问题，可以：
- 查看 Supabase 官方文档
- 检查项目日志
- 在社区寻求帮助
