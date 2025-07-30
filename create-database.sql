-- 创建用户配置文件表
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- 创建触发器
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- 创建索引
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- 启用行级安全
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- 创建自动创建用户配置文件的函数
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

-- 创建触发器：用户注册时自动创建配置文件
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 存储策略
CREATE POLICY "Allow authenticated uploads" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'photo-restoration-images' 
        AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
    );

CREATE POLICY "Allow public downloads" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'photo-restoration-images');

CREATE POLICY "Allow users to delete own files" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'photo-restoration-images' 
        AND (
            auth.uid()::text = (storage.foldername(name))[1]
            OR auth.role() = 'service_role'
        )
    );
