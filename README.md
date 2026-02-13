# 📊 Situation Monitor - 金融监控仪表板

一个实时金融数据监控面板，聚合全球宏观经济指标、加密货币市场动态、AI投资热点等多维度数据。

![Dashboard Preview](docs/screenshot.png)

---

## ✨ 功能特性

### 📈 宏观经济面板

| 面板 | 数据源 | 说明 |
|------|--------|------|
| **收益率曲线** | FRED API | 美国2年期/10年期国债收益率，实时更新 |
| **恐惧贪婪指数** | alternative.me | 市场情绪指标 |
| **MOVE指数** | Yahoo Finance | 债券市场波动率（备用Demo数据） |
| **AI投资链** | Alpha Vantage | NVIDIA等AI芯片股行情与财报倒计时 |
| **美联储倒计时** | 静态数据 | 下次FOMC会议倒计时 |

### 🎯 核心功能

- **🌍 中英文切换** - 完整i18n支持
- **⛶ 全屏模式** - 沉浸式仪表板体验
- **📡 实时数据** - 多API数据聚合
- **💾 智能缓存** - 减少API调用，优化性能
- **📱 响应式设计** - 适配各种屏幕尺寸

---

## 🚀 部署指南

支持两种部署方式：

- **[🐳 Docker 部署](#-docker-容器化部署)** - 推荐，简单快捷
- **[☁️ 手动部署](#-手动部署)** - 精细控制，适合有特殊需求的用户

### 环境要求

- Node.js 18+
- npm 或 pnpm
- Nginx（用于反向代理和静态文件服务）
- Git

### 1. 克隆源码

```bash
cd /root/clawd
git clone https://github.com/corwien/situation-monitor.git
cd situation-monitor
```

### 2. 安装依赖

```bash
npm install
# 或使用 pnpm
pnpm install
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置
nano .env
```

**必需的配置项：**

```env
# FRED API (获取国债收益率)
VITE_FRED_API_KEY=你的FRED_API_KEY

# Alpha Vantage (获取股票数据)
VITE_ALPHA_VANTAGE_API_KEY=你的AlphaVantage_API_KEY

# Finnhub (市场数据，备用)
VITE_FINNHUB_API_KEY=你的Finnhub_API_KEY
```

> **获取API密钥：**
> - FRED: https://fred.stlouisfed.org/docs/api/api_key.html
> - Alpha Vantage: https://www.alphavantage.co/support/#api-key
> - Finnhub: https://finnhub.io/

### 4. 构建项目

```bash
npm run build
```

构建产物将生成在 `build/` 目录。

### 5. 配置Nginx

```bash
# 复制Nginx配置
sudo cp /etc/nginx/sites-available/situation-monitor /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载Nginx
sudo systemctl reload nginx
```

**Nginx配置要点：**

```nginx
server {
    listen 80;
    server_name 66.42.42.182;
    root /var/www/situation-monitor;
    index index.html;

    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # FRED API反向代理（解决CORS）
    location /api/fred/ {
        proxy_pass https://api.stlouisfed.org/fred/;
        add_header Access-Control-Allow-Origin "*";
    }
}
```

### 6. 部署静态文件

```bash
# 复制构建产物到Web目录
sudo rm -rf /var/www/situation-monitor/*
sudo cp -r build/* /var/www/situation-monitor/
sudo chown -R www-data:www-data /var/www/situation-monitor
```

### 7. 验证部署

```bash
# 访问仪表板
curl http://66.42.42.182/

# 检查Nginx状态
sudo systemctl status nginx
```

---

## 🐳 Docker 容器化部署

### 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- Git

### 1. 克隆源码

```bash
cd /root/clawd
git clone https://github.com/corwien/situation-monitor.git
cd situation-monitor
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置（Docker不需要修改，构建时嵌入）
nano .env
```

> **注意:** 在Docker构建时，`.env`文件中的变量会被嵌入到前端代码中。

### 3. 构建并运行

#### 方式一：直接使用Docker

```bash
# 构建镜像
docker build -t situation-monitor .

# 运行容器
docker run -d \
  --name situation-monitor \
  -p 80:80 \
  situation-monitor
```

#### 方式二：使用Docker Compose（推荐）

```bash
# 创建 docker-compose.yml（项目已包含）
# 直接启动
docker compose up -d

# 查看日志
docker compose logs -f

# 停止服务
docker compose down
```

**docker-compose.yml 内容：**

```yaml
version: '3.8'

services:
  situation-monitor:
    build: .
    container_name: situation-monitor
    ports:
      - "80:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 4. 验证部署

```bash
# 访问仪表板
curl http://localhost/

# 检查容器状态
docker ps | grep situation-monitor
```

### 5. 更新部署

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker compose up -d --build

# 或只重启（无需重新构建）
docker compose restart
```

### Docker 镜像结构

```
+------------------+
|  Nginx (端口80)   |
|  - SPA路由支持    |
|  - FRED API代理   |
|  - Gzip压缩       |
+------------------+
|  Node.js 构建层   |
|  - SvelteKit     |
|  - 静态资源输出   |
+------------------+
```

### Docker 部署优势

| 优势 | 说明 |
|------|------|
| 🚀 **快速部署** | 一键启动，无需手动配置Nginx |
| 🔒 **环境隔离** | 容器内环境一致，不受主机影响 |
| 📦 **版本管理** | 通过标签管理不同版本 |
| 🔄 **自动重启** | 容器崩溃自动恢复 |
| 📊 **健康检查** | 内置健康检查机制 |

---

## ☁️ 手动部署

### 环境要求

- Node.js 18+
- npm 或 pnpm
- Nginx（用于反向代理和静态文件服务）
- Git

### 1. 克隆源码

```bash
cd /root/clawd
git clone https://github.com/corwien/situation-monitor.git
cd situation-monitor
```

### 2. 安装依赖

```bash
npm install
# 或使用 pnpm
pnpm install
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置
nano .env
```

### 4. 构建项目

```bash
npm run build
```

构建产物将生成在 `build/` 目录。

### 5. 配置Nginx

```bash
# 复制Nginx配置
sudo cp /etc/nginx/sites-available/situation-monitor /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载Nginx
sudo systemctl reload nginx
```

### 6. 部署静态文件

```bash
# 复制构建产物到Web目录
sudo rm -rf /var/www/situation-monitor/*
sudo cp -r build/* /var/www/situation-monitor/
sudo chown -R www-data:www-data /var/www/situation-monitor
```

### 7. 验证部署

```bash
# 访问仪表板
curl http://66.42.42.182/

# 检查Nginx状态
sudo systemctl status nginx
```

---

## 📁 目录结构

```
situation-monitor/
├── src/
│   ├── lib/
│   │   ├── api/                 # API集成模块
│   │   │   ├── index.ts         # API统一出口
│   │   │   ├── alphavantage.ts # Alpha Vantage股票数据
│   │   │   ├── feargreed.ts    # 恐惧贪婪指数
│   │   │   ├── markets.ts      # 市场数据（ Finnhub）
│   │   │   ├── moveIndex.ts    # MOVE指数
│   │   │   └── treasury.ts     # 国债收益率（FRED）
│   │   ├── components/          # Svelte组件
│   │   │   ├── layout/          # 布局组件
│   │   │   │   └── Header.svelte
│   │   │   ├── panels/          # 数据面板
│   │   │   │   ├── AiInvestmentChainPanel.svelte
│   │   │   │   ├── FearGreedPanel.svelte
│   │   │   │   ├── FedPanel.svelte
│   │   │   │   ├── MoveIndexPanel.svelte
│   │   │   │   └── YieldCurvePanel.svelte
│   │   │   └── WorldMap.svelte
│   │   ├── i18n/                # 国际化
│   │   │   ├── index.ts
│   │   │   └── locales/
│   │   │       ├── en.json
│   │   │       └── zh.json
│   │   ├── stores/              # Svelte状态管理
│   │   │   └── feargreed.ts
│   │   ├── utils/               # 工具函数
│   │   │   └── cache.ts         # 客户端缓存
│   │   └── scrapers/            # 数据抓取模块
│   │       └── index.ts
│   ├── routes/
│   │   ├── +page.svelte         # 主页面
│   │   └── api/                 # API路由
│   └── app.html
├── static/                      # 静态资源
├── docs/                        # 文档
│   ├── NEW_FEATURES_v2.1.0.md
│   └── RELEASE_v2.1.0.md
├── build/                       # 构建产物（部署用）
├── .env                         # 环境变量（敏感）
├── .env.example                 # 环境变量模板
├── package.json
├── svelte.config.js
├── vite.config.ts
├── nginx.conf                   # Nginx配置（Docker/手动）
├── Dockerfile                   # Docker构建文件
└── docker-compose.yml          # Docker Compose配置
```

---

## 🔧 源码架构

### 技术栈

| 类别 | 技术 |
|------|------|
| **前端框架** | SvelteKit |
| **构建工具** | Vite |
| **样式** | Tailwind CSS |
| **状态管理** | Svelte Stores |
| **国际化** | 自研i18n方案 |
| **部署** | Docker / Nginx + Static Adapter |

### 数据流架构

```
┌─────────────────────────────────────────────────────────────┐
│                    数据获取层 (src/lib/api)                  │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│  FRED API   │ Alpha Vantage│ alternative.me│  Yahoo Finance  │
│  (国债收益)  │   (股票)     │  (恐惧贪婪)  │   (MOVE指数)     │
└──────┬──────┴──────┬──────┴──────┬──────┴────────┬─────────┘
       │              │              │               │
       └──────────────┴──────────────┴───────────────┘
                                │
                    ┌───────────┴───────────┐
                    │   客户端缓存 (cache.ts) │
                    │   - 减少API调用        │
                    │   - 离线支持           │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │   Svelte Stores       │
                    │   - 状态管理           │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │   UI Components        │
                    │   - 面板渲染           │
                    │   - 图表展示           │
                    └────────────────────────┘
```

### 关键文件说明

| 文件 | 作用 |
|------|------|
| `src/lib/api/treasury.ts` | 获取FRED国债数据，支持Nginx代理和缓存 |
| `src/lib/utils/cache.ts` | 客户端缓存系统，统一管理API响应缓存 |
| `src/lib/components/layout/Header.svelte` | 顶部导航，包含全屏和中英文切换 |
| `src/lib/i18n/locales/*.json` | 中英文翻译文件 |

---

## 📡 API配置说明

### 1. FRED API (收益率曲线)

**用途:** 获取美国国债收益率数据

**端点:** `https://api.stlouisfed.org/fred/`

**系列ID:**
- `DGS2` - 2年期国债收益率
- `DGS10` - 10年期国债收益率

**代理配置:** Nginx反向代理 `/api/fred/` → `https://api.stlouisfed.org/fred/`

### 2. Alpha Vantage API (股票数据)

**用途:** 获取AI芯片股行情和财报日期

**端点:** `https://www.alphavantage.co/query`

**功能:**
- `TIME_SERIES_DAILY` - 日线行情
- `EARNINGS_CALENDAR` - 财报日历

### 3. alternative.me (恐惧贪婪指数)

**用途:** 获取市场情绪指标

**端点:** `https://api.alternative.me/fng/`

**返回:**
- `value` - 指数值 (0-100)
- `value_classification` - 情绪分类

---

## ⚠️ 注意事项

### API限制

| 服务 | 限制 | 建议 |
|------|------|------|
| Alpha Vantage | 25次/天 | 缓存6小时以上 |
| Finnhub | 60次/分钟 | 避免频繁刷新 |
| FRED | 无限制 | 可实时调用 |

### CORS问题

- 浏览器直接调用FRED API会被CORS阻止
- 解决方案：使用Nginx反向代理（已配置）

### 数据准确性

- **MOVE指数**: 免费数据源有限，默认显示Demo数据(95.2)
- **美联储倒计时**: 基于公开的FOMC日程表
- **财报日期**: 可能因公司调整而变化

### 缓存策略

```typescript
// 缓存配置 (src/lib/utils/cache.ts)
const CACHE_CONFIG = {
  treasury: { ttl: 3600000 },      // 1小时
  fearGreed: { ttl: 3600000 },     // 1小时
  moveIndex: { ttl: 1800000 },     // 30分钟
  stockQuotes: { ttl: 900000 },     // 15分钟
};
```

---

## 🐛 常见问题

### Q: 收益率曲线显示"Demo"而非"LIVE"？

A: 检查Nginx代理配置：
```bash
curl http://66.42.42.182/api/fred/series/observations?series_id=DGS2
```
如果返回XML数据，说明代理正常。

### Q: MOVE指数如何获取真实数据？

A: MOVE指数的免费数据源有限。选项：
1. 购买Finnhub Pro订阅
2. 使用Polygon.io付费API
3. 手动更新Demo数据

### Q: 如何切换中英文？

A: 点击右上角的语言切换按钮（🌐 EN/中文）。

### Q: 全屏模式如何退出？

A: 点击⛶按钮或按ESC键。

---

## 📝 更新日志

| 版本 | 日期 | 主要变更 |
|------|------|----------|
| v2.1.0 | 2026-02-12 | 全屏模式、FRED代理、缓存系统、MOVE备用方案 |
| v2.0.0 | 2026-02-11 | 初始版本，核心面板功能 |

完整更新日志请查看 [docs/RELEASE_v2.1.0.md](docs/RELEASE_v2.1.0.md)

---

## 📄 许可证

MIT License

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

**仓库地址:** https://github.com/corwien/situation-monitor

---

*最后更新: 2026-02-13*
