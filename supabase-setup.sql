-- =====================================================
-- Supabase 项目重建 SQL 脚本
-- 用于照片修复项目 (colorold)
-- =====================================================

-- 1. 创建用户配置文件表
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建更新时间触发器函数
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- 3. 为 profiles 表创建更新时间触发器
-- =====================================================
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- 4. 创建索引以提高查询性能
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- 5. 启用行级安全策略 (RLS)
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. 删除现有策略（如果存在）
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- 7. 创建 RLS 策略
-- =====================================================

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

-- 8. 创建自动创建用户配置文件的函数
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql' SECURITY DEFINER;

-- 9. 创建触发器：用户注册时自动创建配置文件
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. 创建使用记录表（可选，用于更精确的使用限制）
-- =====================================================
CREATE TABLE IF NOT EXISTS public.usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address INET,
    usage_date DATE DEFAULT CURRENT_DATE,
    usage_count INTEGER DEFAULT 1,
    service_type VARCHAR(50) DEFAULT 'photo_restoration',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 确保每个用户每天只有一条记录
    UNIQUE(user_id, usage_date),
    -- 确保每个IP每天只有一条记录（用于游客限制）
    UNIQUE(ip_address, usage_date)
);

-- 11. 为使用记录表创建索引
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_usage_records_user_date ON public.usage_records(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_usage_records_ip_date ON public.usage_records(ip_address, usage_date);
CREATE INDEX IF NOT EXISTS idx_usage_records_service_type ON public.usage_records(service_type);

-- 12. 创建文件上传记录表（可选，用于跟踪上传的文件）
-- =====================================================
CREATE TABLE IF NOT EXISTS public.uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    bucket_name VARCHAR(100) DEFAULT 'photo-restoration-images',
    is_processed BOOLEAN DEFAULT FALSE,
    processed_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. 为文件记录表创建索引
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user ON public.uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_bucket ON public.uploaded_files(bucket_name);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_processed ON public.uploaded_files(is_processed);

-- 14. 创建一些有用的视图
-- =====================================================

-- 用户统计视图
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.created_at as user_created_at,
    COALESCE(ur.total_usage, 0) as total_usage,
    COALESCE(ur.today_usage, 0) as today_usage,
    COALESCE(uf.total_files, 0) as total_files_uploaded
FROM public.profiles p
LEFT JOIN (
    SELECT 
        user_id,
        SUM(usage_count) as total_usage,
        SUM(CASE WHEN usage_date = CURRENT_DATE THEN usage_count ELSE 0 END) as today_usage
    FROM public.usage_records 
    GROUP BY user_id
) ur ON p.id = ur.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_files
    FROM public.uploaded_files 
    GROUP BY user_id
) uf ON p.id = uf.user_id;

-- 15. 创建一些有用的函数
-- =====================================================

-- 获取用户今日使用次数
CREATE OR REPLACE FUNCTION public.get_user_today_usage(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT usage_count 
         FROM public.usage_records 
         WHERE user_id = user_uuid AND usage_date = CURRENT_DATE),
        0
    );
END;
$$ LANGUAGE 'plpgsql' SECURITY DEFINER;

-- 增加用户使用次数
CREATE OR REPLACE FUNCTION public.increment_user_usage(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    current_usage INTEGER;
BEGIN
    -- 插入或更新使用记录
    INSERT INTO public.usage_records (user_id, usage_date, usage_count)
    VALUES (user_uuid, CURRENT_DATE, 1)
    ON CONFLICT (user_id, usage_date)
    DO UPDATE SET usage_count = usage_records.usage_count + 1;
    
    -- 返回当前使用次数
    SELECT usage_count INTO current_usage
    FROM public.usage_records
    WHERE user_id = user_uuid AND usage_date = CURRENT_DATE;
    
    RETURN current_usage;
END;
$$ LANGUAGE 'plpgsql' SECURITY DEFINER;

-- =====================================================
-- 脚本执行完成
-- =====================================================

-- 显示创建的表
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'usage_records', 'uploaded_files')
ORDER BY tablename;
