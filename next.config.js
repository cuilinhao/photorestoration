/** @type {import('next').NextConfig} */
const nextConfig = {
  // 注释掉静态导出配置，因为我们需要 API 路由
  // output: 'export',
  // 移除 distDir 配置，使用默认的 .next 目录
  // distDir: 'out',
  images: {
    unoptimized: true,
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
      // 添加 Supabase 域名
      "zupgdrroxoapstcxbpgo.supabase.co",
      // 添加 Replicate 域名
      "replicate.delivery",
      "pbxt.replicate.delivery"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "zupgdrroxoapstcxbpgo.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pbxt.replicate.delivery",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
