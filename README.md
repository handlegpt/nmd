# NOMAD.NOW

数字游民的工具平台 - 极简风格，专注于实用信息

## 🌟 特色功能

- **实时信息显示**: 当前位置时间、天气、WiFi速度、签证剩余天数
- **签证倒计时提醒**: 智能提醒系统，避免签证逾期
- **城市投票榜单**: 社区驱动的城市推荐系统，支持多维度评分
- **AI个性化推荐**: 基于用户偏好智能推荐城市
- **城市对比工具**: 可视化对比多个城市的各项指标
- **多语言支持**: 中文、西班牙语、日语完整翻译
- **极简设计**: 像 time.is 一样简洁，一眼看到关键信息
- **自动化数据**: 天气、时间自动更新，减少维护成本
- **社区互动**: 轻量化社交功能，增加用户粘性
- **盈利模式**: 订阅制 + Affiliate 链接，可持续运营

## 🚀 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Supabase (PostgreSQL + Auth + Real-time)
- **API集成**: 
  - 世界时间: worldtimeapi.org
  - 天气: OpenWeatherMap API
  - WiFi速度: 缓存第三方统计数据
- **图标**: Lucide React
- **多语言**: 自定义i18n系统
- **部署**: Docker + Docker Compose

## �� 多语言支持

### 支持的语言
- 🇺🇸 **英语** (en) - 默认语言
- 🇨🇳 **中文** (zh) - 简体中文
- 🇪🇸 **西班牙语** (es) - Español
- 🇯🇵 **日语** (ja) - 日本語

### 语言切换
- 页面右上角的语言切换器
- 自动检测浏览器语言
- 本地存储语言偏好
- 支持URL参数切换语言

### 翻译文件结构
```
src/locales/
├── en.json                      # 英语翻译
├── zh.json                      # 中文翻译
├── es.json                      # 西班牙语翻译
└── ja.json                      # 日语翻译

src/i18n/
├── config.ts                    # 语言配置
└── utils.ts                     # 翻译工具函数

src/hooks/
└── useTranslation.ts            # 翻译Hook
```

## 📦 快速部署 (Docker)

### 1. 克隆项目
```bash
git clone <repository-url>
cd nomad-now
```

### 2. 配置环境变量

编辑 `docker-compose.yml` 文件，更新以下环境变量：

```yaml
environment:
  - NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  - NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
  - NEXT_PUBLIC_OPENWEATHER_API_KEY=your-openweather-api-key-here
```

### 3. 构建和启动

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

### 4. 访问网站
打开浏览器访问: http://localhost:3011

### 5. 常用命令

```bash
# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 更新部署
docker-compose up --build -d
```

## 🔧 环境变量配置

### 必需的API密钥

1. **Supabase 配置**
   - 访问 [Supabase](https://supabase.com) 创建项目
   - 获取项目 URL 和 Anon Key
   - 配置数据库表结构（参考 `database/` 目录）

2. **OpenWeather API**
   - 访问 [OpenWeatherMap](https://openweathermap.org/api) 注册账号
   - 获取免费 API Key

### 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_OPENWEATHER_API_KEY` | OpenWeather API 密钥 | `1234567890abcdef...` |

## 📦 本地开发

1. 安装依赖
```bash
npm install
```

2. 配置环境变量
```bash
cp env.example .env.local
# 编辑 .env.local 文件，添加你的API密钥
```

3. 启动开发服务器
```bash
npm run dev
```

4. 访问开发环境
打开浏览器访问: http://localhost:3000

## 🗄️ 数据库设置

### Supabase 表结构

项目使用以下数据表：

1. **cities** - 城市信息
2. **users** - 用户信息
3. **votes** - 城市投票
4. **places** - 地点推荐
5. **place_votes** - 地点投票
6. **place_reviews** - 地点评价

详细的数据库设置说明请参考 `database/` 目录。

## 🔒 安全特性

- **Docker 安全**: 使用非 root 用户运行应用
- **环境变量**: 敏感信息通过环境变量配置
- **文件过滤**: 使用 `.dockerignore` 防止敏感文件泄露
- **依赖安全**: 保留 `package-lock.json` 确保依赖版本一致性
- **健康检查**: 内置健康检查端点 `/api/health`

## 📊 监控和维护

### 健康检查
```bash
curl http://localhost:3011/api/health
```

### 日志查看
```bash
# 查看应用日志
docker-compose logs -f app

# 查看所有服务日志
docker-compose logs -f
```

### 性能监控
- 应用运行在端口 3011
- 健康检查间隔: 30秒
- 自动重启策略已配置

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持

如果你遇到问题或有建议，请：

1. 查看 [SECURITY.md](SECURITY.md) 了解安全政策
2. 在 GitHub Issues 中报告问题
3. 联系项目维护者

---

**NOMAD.NOW** - 让数字游民的生活更简单 🌍
