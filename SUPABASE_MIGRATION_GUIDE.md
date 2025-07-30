# Supabase 使用情况梳理与迁移指南

## 📋 项目中 Supabase 使用概览

### 🔧 核心功能
1. **用户认证系统** - 注册、登录、登出
2. **用户配置文件管理** - 存储用户基本信息
3. **文件存储服务** - 上传和管理图片文件
4. **使用次数限制** - 基于用户状态的配额管理

---

## 🗄️ 数据库结构

### 1. 用户认证表 (auth.users)
Supabase 内置的认证表，包含：
- `id` (UUID) - 主键
- `email` (VARCHAR) - 用户邮箱
- `encrypted_password` (VARCHAR) - 加密密码
- `email_confirmed_at` (TIMESTAMP) - 邮箱确认时间
- `created_at` (TIMESTAMP) - 创建时间
- `updated_at` (TIMESTAMP) - 更新时间

### 2. 用户配置文件表 (public.profiles)
```sql
-- 用户配置文件表
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 创建索引
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_username ON public.profiles(username);
```

---

## 🔐 行级安全策略 (RLS)

### 1. 启用 RLS
```sql
-- 启用行级安全
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### 2. 配置文件表策略
```sql
-- 用户只能查看自己的配置文件
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- 用户只能插入自己的配置文件
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 用户只能更新自己的配置文件
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 用户只能删除自己的配置文件
CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);
```

---

## 📁 存储桶配置

### 1. 创建存储桶
```sql
-- 在 Supabase Dashboard 中创建存储桶
-- 桶名: photo-restoration-images
-- 公开访问: true
-- 文件大小限制: 50MB
-- 允许的文件类型: image/*
```

### 2. 存储策略
```sql
-- 允许所有用户上传文件
CREATE POLICY "Allow public uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'photo-restoration-images');

-- 允许所有用户查看文件
CREATE POLICY "Allow public access" ON storage.objects
    FOR SELECT USING (bucket_id = 'photo-restoration-images');

-- 允许用户删除自己上传的文件
CREATE POLICY "Allow users to delete own files" ON storage.objects
    FOR DELETE USING (bucket_id = 'photo-restoration-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 🔧 环境变量配置

### 必需的环境变量
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_STORAGE_BUCKET=photo-restoration-images
```

---

## 📂 代码文件使用情况

### 1. 核心配置文件
- `src/lib/supabase.ts` - Supabase 客户端配置和数据库操作
- `src/contexts/UserContext.tsx` - 用户状态管理和认证逻辑

### 2. 认证相关
- `src/components/AuthModal.tsx` - 登录/注册模态框
- 认证功能：注册、登录、登出、用户状态管理

### 3. 文件存储
- 文件上传到 `photo-restoration-images` 存储桶
- 支持降级到 base64 本地存储
- 自动处理 RLS 权限问题

### 4. 使用限制
- 游客用户：每日 3 次
- 登录用户：每日 5 次  
- 高级用户：无限制
- 基于 localStorage 和内存存储

---

## 🚀 迁移到其他数据库

### 选项 1: PostgreSQL + MinIO/S3

#### 数据库迁移 SQL
```sql
-- 1. 创建用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建用户配置文件表
CREATE TABLE profiles (
    id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建使用记录表
CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET,
    usage_date DATE DEFAULT CURRENT_DATE,
    usage_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, usage_date),
    UNIQUE(ip_address, usage_date)
);

-- 4. 创建文件记录表
CREATE TABLE uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_usage_records_user_date ON usage_records(user_id, usage_date);
CREATE INDEX idx_usage_records_ip_date ON usage_records(ip_address, usage_date);
CREATE INDEX idx_uploaded_files_user ON uploaded_files(user_id);

-- 6. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 选项 2: MySQL + 云存储

#### MySQL 迁移 SQL
```sql
-- 1. 创建用户表
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. 创建用户配置文件表
CREATE TABLE profiles (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. 创建使用记录表
CREATE TABLE usage_records (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    ip_address VARCHAR(45),
    usage_date DATE DEFAULT (CURRENT_DATE),
    usage_count INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, usage_date),
    UNIQUE KEY unique_ip_date (ip_address, usage_date)
);

-- 4. 创建文件记录表
CREATE TABLE uploaded_files (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_usage_records_user_date ON usage_records(user_id, usage_date);
CREATE INDEX idx_usage_records_ip_date ON usage_records(ip_address, usage_date);
CREATE INDEX idx_uploaded_files_user ON uploaded_files(user_id);
```

---

## 🔄 迁移步骤

### 第一阶段：准备工作
1. **备份现有数据**
   ```bash
   # 导出 Supabase 数据
   pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
   ```

2. **设置新的数据库环境**
   - 安装 PostgreSQL/MySQL
   - 配置连接参数
   - 运行迁移 SQL 脚本

3. **设置文件存储**
   - 配置 MinIO/S3/阿里云 OSS
   - 迁移现有文件

### 第二阶段：代码修改
1. **替换认证逻辑**
   - 实现自定义 JWT 认证
   - 修改 `src/lib/supabase.ts`
   - 更新 `src/contexts/UserContext.tsx`

2. **替换存储逻辑**
   - 实现新的文件上传接口
   - 配置新的存储服务

3. **更新环境变量**
   ```env
   # 新的数据库配置
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname

   # 新的存储配置
   STORAGE_ENDPOINT=https://your-storage-endpoint
   STORAGE_ACCESS_KEY=your-access-key
   STORAGE_SECRET_KEY=your-secret-key
   STORAGE_BUCKET=photo-restoration-images

   # JWT 配置
   JWT_SECRET=your-jwt-secret
   JWT_EXPIRES_IN=7d
   ```

### 第三阶段：测试和部署
1. **功能测试**
   - 用户注册/登录
   - 文件上传/下载
   - 使用限制功能

2. **性能测试**
   - 数据库查询性能
   - 文件上传速度
   - 并发处理能力

3. **逐步迁移**
   - 灰度发布
   - 监控错误日志
   - 回滚方案准备

---

## 📊 迁移对比

| 功能 | Supabase | PostgreSQL + MinIO | MySQL + 云存储 |
|------|----------|-------------------|----------------|
| 认证 | 内置 | 自实现 JWT | 自实现 JWT |
| 存储 | 内置 | MinIO/S3 | 阿里云OSS/AWS S3 |
| 实时功能 | 内置 | 需要 WebSocket | 需要 WebSocket |
| 管理界面 | 内置 | 需要自建 | 需要自建 |
| 成本 | 按用量计费 | 服务器成本 | 服务器+存储成本 |
| 维护复杂度 | 低 | 中等 | 中等 |

---

## ⚠️ 注意事项

1. **数据一致性**
   - 确保迁移过程中数据完整性
   - 设置适当的外键约束

2. **安全性**
   - 实现密码加密（bcrypt）
   - 配置 HTTPS
   - 设置适当的 CORS 策略

3. **性能优化**
   - 配置数据库连接池
   - 设置适当的索引
   - 实现缓存策略

4. **监控和日志**
   - 设置错误监控
   - 配置访问日志
   - 实现健康检查

---

## 🛠️ 推荐的替代方案

### 认证服务
- **Auth0** - 企业级认证服务
- **Firebase Auth** - Google 的认证服务
- **自实现 JWT** - 完全控制的方案

### 存储服务
- **AWS S3** - 最成熟的对象存储
- **阿里云 OSS** - 国内访问速度快
- **MinIO** - 自托管的 S3 兼容存储

### 数据库
- **PostgreSQL** - 功能强大的开源数据库
- **MySQL** - 广泛使用的关系型数据库
- **MongoDB** - 文档型数据库（需要重构数据模型）

---

## 📝 总结

这份迁移指南涵盖了项目中 Supabase 的所有使用情况：

### 当前使用的 Supabase 功能：
1. **用户认证** - 注册、登录、登出
2. **用户配置文件** - 存储在 `profiles` 表
3. **文件存储** - 图片上传到 `photo-restoration-images` 存储桶
4. **使用限制** - 基于用户状态的配额管理

### 迁移建议：
- **小型项目**：选择 MySQL + 阿里云 OSS
- **中型项目**：选择 PostgreSQL + MinIO
- **大型项目**：考虑微服务架构，使用专业的认证服务

### 关键迁移点：
1. 数据库表结构完全兼容
2. 认证逻辑需要重写
3. 文件存储需要更换服务商
4. 使用限制逻辑保持不变

你可以根据具体需求和预算选择合适的迁移方案。建议先在测试环境中验证迁移方案的可行性。
