# Resend 邮件服务配置

## 1. 注册 Resend 账户

1. 访问 [Resend官网](https://resend.com)
2. 注册一个免费账户
3. 验证您的邮箱地址

## 2. 获取 API 密钥

1. 登录 Resend 控制台
2. 进入 "API Keys" 页面
3. 点击 "Create API Key"
4. 复制生成的 API 密钥

## 3. 配置环境变量

在项目根目录创建 `.env.local` 文件，添加以下配置：

```bash
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 其他配置...
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. 验证域名（可选）

为了发送邮件，您需要验证您的域名：

1. 在 Resend 控制台添加您的域名
2. 按照指示配置 DNS 记录
3. 等待 DNS 验证完成

## 5. 安装依赖

```bash
npm install resend
```

## 6. 测试邮件发送

启动开发服务器后，访问登录页面测试邮件发送功能。

## 注意事项

- Resend 免费账户每月可发送 3,000 封邮件
- 开发环境可以使用 Resend 提供的测试域名
- 生产环境建议使用自己的域名
