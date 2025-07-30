-- =====================================================
-- Supabase 存储桶设置 SQL 脚本
-- 用于照片修复项目的文件存储
-- =====================================================

-- 注意：存储桶需要在 Supabase Dashboard 中手动创建
-- 这个脚本主要用于设置存储策略

-- 1. 删除现有的存储策略（如果存在）
-- =====================================================
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own files" ON storage.objects;

-- 2. 创建存储策略 - 允许所有用户上传文件
-- =====================================================
CREATE POLICY "Allow authenticated uploads" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'photo-restoration-images' 
        AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
    );

-- 3. 创建存储策略 - 允许所有用户查看文件
-- =====================================================
CREATE POLICY "Allow public downloads" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'photo-restoration-images');

-- 4. 创建存储策略 - 允许用户删除自己上传的文件
-- =====================================================
CREATE POLICY "Allow users to delete own files" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'photo-restoration-images' 
        AND (
            auth.uid()::text = (storage.foldername(name))[1]
            OR auth.role() = 'service_role'
        )
    );

-- 5. 创建存储策略 - 允许用户更新自己上传的文件
-- =====================================================
CREATE POLICY "Allow users to update own files" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'photo-restoration-images' 
        AND (
            auth.uid()::text = (storage.foldername(name))[1]
            OR auth.role() = 'service_role'
        )
    );

-- 6. 创建更宽松的上传策略（如果上面的策略太严格）
-- =====================================================
-- 如果需要允许匿名用户上传，可以使用这个策略
-- CREATE POLICY "Allow anonymous uploads" ON storage.objects
--     FOR INSERT 
--     WITH CHECK (bucket_id = 'photo-restoration-images');

-- 7. 创建存储桶（通过 SQL，但建议在 Dashboard 中创建）
-- =====================================================
-- 注意：这个命令可能需要超级用户权限，建议在 Dashboard 中手动创建
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--     'photo-restoration-images',
--     'photo-restoration-images',
--     true,
--     52428800, -- 50MB in bytes
--     ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff']
-- )
-- ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 手动创建存储桶的步骤（在 Supabase Dashboard 中）
-- =====================================================

/*
1. 登录 Supabase Dashboard
2. 进入你的项目
3. 点击左侧菜单的 "Storage"
4. 点击 "Create a new bucket"
5. 设置以下参数：
   - Name: photo-restoration-images
   - Public bucket: ✅ (勾选)
   - File size limit: 50 MB
   - Allowed MIME types: image/*
6. 点击 "Save"
*/

-- =====================================================
-- 验证存储策略
-- =====================================================

-- 查看当前存储策略
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- 查看存储桶信息
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets 
WHERE id = 'photo-restoration-images';

-- =====================================================
-- 测试存储功能的辅助函数
-- =====================================================

-- 创建一个函数来测试存储权限
CREATE OR REPLACE FUNCTION public.test_storage_permissions()
RETURNS TABLE (
    test_name TEXT,
    result TEXT,
    details TEXT
) AS $$
BEGIN
    -- 测试是否可以查看存储桶
    RETURN QUERY
    SELECT 
        'Bucket Visibility'::TEXT as test_name,
        CASE 
            WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'photo-restoration-images')
            THEN 'PASS'::TEXT
            ELSE 'FAIL'::TEXT
        END as result,
        'Check if photo-restoration-images bucket exists'::TEXT as details;
    
    -- 测试存储策略数量
    RETURN QUERY
    SELECT 
        'Storage Policies'::TEXT as test_name,
        CASE 
            WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') >= 3
            THEN 'PASS'::TEXT
            ELSE 'FAIL'::TEXT
        END as result,
        CONCAT('Found ', (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'), ' storage policies')::TEXT as details;
END;
$$ LANGUAGE 'plpgsql' SECURITY DEFINER;

-- =====================================================
-- 清理函数（如果需要重置）
-- =====================================================

-- 创建清理存储策略的函数
CREATE OR REPLACE FUNCTION public.cleanup_storage_policies()
RETURNS TEXT AS $$
BEGIN
    -- 删除所有相关的存储策略
    DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to update own files" ON storage.objects;
    DROP POLICY IF EXISTS "Allow anonymous uploads" ON storage.objects;
    
    RETURN 'Storage policies cleaned up successfully';
END;
$$ LANGUAGE 'plpgsql' SECURITY DEFINER;

-- =====================================================
-- 脚本执行完成
-- =====================================================

-- 运行测试函数
SELECT * FROM public.test_storage_permissions();
