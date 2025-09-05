# 安全配置指南

## 🔒 Docker 安全措施

### 1. .dockerignore 文件
项目已配置完整的 `.dockerignore` 文件，防止以下敏感文件被复制到Docker镜像：

- **环境变量文件**: `.env`, `.env*.local`
- **Git信息**: `.git`, `.gitignore`
- **IDE配置**: `.vscode`, `.idea`
- **临时文件**: `temp`, `tmp`, `*.log`
- **系统文件**: `.DS_Store`, `Thumbs.db`
- **文档文件**: `README.md`, `*.md`

### 2. 环境变量安全
```bash
# 创建本地环境变量文件（不会被提交到Git）
cp .env.example .env.local

# 在 .env.local 中配置实际的环境变量
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 3. Docker 安全最佳实践

#### 生产环境部署
```bash
# 使用安装脚本
chmod +x install.sh
./install.sh

# 或手动部署
docker-compose up --build -d

# 检查容器安全
docker-compose ps
docker-compose logs -f
```

### 4. 网络安全

#### 端口配置
- 默认端口: 3010
- 可通过环境变量 `PORT` 自定义
- 生产环境建议使用反向代理（Nginx）

#### 健康检查
```bash
# 检查服务健康状态
curl http://localhost:3010/api/health
```

### 5. 文件权限安全

#### Docker 容器权限
- 使用非root用户运行应用
- 最小权限原则
- 只复制必要的文件

#### 本地文件权限
```bash
# 设置正确的文件权限
chmod 600 .env.local
chmod 644 .dockerignore
```

### 6. 安全检查清单

- [ ] 环境变量文件未被提交到Git
- [ ] .dockerignore 文件配置完整
- [ ] 使用非root用户运行容器
- [ ] 健康检查端点正常工作
- [ ] 生产环境使用HTTPS
- [ ] 定期更新依赖包

### 7. 常见安全问题

#### 问题1: 环境变量泄露
**解决方案**: 确保 `.env` 文件在 `.dockerignore` 中

#### 问题2: 敏感文件被复制
**解决方案**: 检查 `.dockerignore` 配置

#### 问题3: 容器权限过高
**解决方案**: 使用 `USER nextjs` 指令

### 8. 安全监控

#### 日志监控
```bash
# 查看应用日志
docker-compose logs -f web

# 查看错误日志
docker-compose logs -f web | grep ERROR
```

#### 资源监控
```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
docker system df
```

## 🛡️ 安全更新

定期更新项目依赖以修复安全漏洞：

```bash
# 更新依赖
npm audit fix

# 重新构建Docker镜像
docker-compose build --no-cache
```

## 📞 安全报告

如发现安全问题，请通过以下方式报告：
- GitHub Issues
- 邮件联系项目维护者 