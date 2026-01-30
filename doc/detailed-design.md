# Situation Monitor - 详细设计文档

## 一、系统定位

Situation Monitor 是一个运行在浏览器中的**纯前端单页应用（SPA）**。它没有后端服务器，所有逻辑都在用户的浏览器里执行。

**一句话总结**：从公开 API 抓数据 → 在浏览器里分析 → 以仪表盘形式展示。

## 二、核心设计决策

### 2.1 为什么选择纯前端架构？

| 优点 | 说明 |
|------|------|
| 零运维成本 | 不需要服务器，部署到 Vercel/GitHub Pages 即可 |
| 隐私性 | 用户数据不离开浏览器 |
| 简单 | 一个代码库搞定所有事 |

| 缺点 | 说明 |
|------|------|
| API 密钥暴露 | 前端代码可以被用户看到（Finnhub/FRED key） |
| CORS 限制 | 需要额外的代理服务 |
| 无法后台运行 | 关闭浏览器就停止工作 |

### 2.2 配置驱动设计

项目大量使用"配置驱动"模式。什么意思？

**传统写法**（逻辑和数据混在一起）：
```typescript
// ❌ 硬编码在逻辑中
if (title.includes("war") || title.includes("nuclear") || title.includes("invasion")) {
  isAlert = true;
}
```

**本项目写法**（配置和逻辑分离）：
```typescript
// ✅ 配置文件 config/keywords.ts
export const ALERT_KEYWORDS = ['war', 'nuclear', 'invasion', ...];

// ✅ 逻辑文件
export function containsAlertKeyword(text: string): boolean {
  return ALERT_KEYWORDS.some(kw => text.toLowerCase().includes(kw));
}
```

**好处**：想新增一个警报关键词？在配置文件加一个字符串就行，不需要改任何逻辑代码。

## 三、各子系统详细设计

### 3.1 类型系统 (`types/index.ts`)

所有数据结构都在一个文件中集中定义，确保全项目一致。

#### 核心数据类型

```typescript
// 新闻条目 — 系统中最重要的数据类型
interface NewsItem {
  title: string;         // 标题
  link: string;          // 原文链接
  source: string;        // 来源（如 "bbc.co.uk"）
  pubDate: string;       // 发布时间
  category: NewsCategory; // 分类（politics/tech/finance/government/ai/intel）
  isAlert?: boolean;     // 是否触发警报（标题含敏感关键词）
  region?: string;       // 涉及的地区
  topics?: string[];     // 涉及的话题
  image?: string;        // 配图 URL
}

// 新闻分类
type NewsCategory = 'politics' | 'tech' | 'finance' | 'government' | 'ai' | 'intel';

// 市场数据
interface MarketItem {
  symbol: string;        // 股票代码（如 "SPY"）
  name: string;          // 名称（如 "S&P 500"）
  price: number;         // 当前价格
  change: number;        // 涨跌额
  changePercent: number; // 涨跌幅（百分比）
}

// 加密货币
interface CryptoItem {
  id: string;            // 如 "bitcoin"
  symbol: string;        // 如 "BTC"
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

// 自定义监控器
interface CustomMonitor {
  id: string;
  name: string;          // 监控器名称
  keywords: string[];    // 要监控的关键词列表
  enabled: boolean;      // 是否启用
  matches: NewsItem[];   // 匹配到的新闻（运行时填充）
}
```

### 3.2 配置子系统详细设计

#### RSS 信息源配置 (`config/feeds.ts`)

```
6 个分类，共 30+ 个信息源：

politics（政治）：
  BBC World, NPR, The Guardian, NYT, PBS NewsHour, Al Jazeera ...

tech（科技）：
  Hacker News, Ars Technica, The Verge, TechCrunch, Wired ...

finance（金融）：
  CNBC, Bloomberg, MarketWatch, Financial Times ...

government（政府）：
  White House, State Dept, Pentagon, Congressional Record ...

ai（人工智能）：
  OpenAI Blog, DeepMind, MIT Tech Review AI ...

intel（情报/国防）：
  CSIS, Brookings, CFR, Defense One, Bellingcat, CISA ...
```

每个源的数据结构：
```typescript
interface FeedSource {
  name: string;    // 显示名称
  url: string;     // RSS 地址
  category: NewsCategory;
}
```

#### 关联主题配置 (`config/analysis.ts`)

定义了 20 个关联主题，每个主题有：
- **名称**（如 "Tariffs & Trade War"）
- **正则模式**（如 `/tariff|trade war|import duties/i`）
- **分类**（Economy / Geopolitics / Technology / Conflict）
- **预测文本**（当达到阈值时显示的预警）

示例：
```typescript
{
  name: "Tariffs & Trade War",
  pattern: /tariff|trade war|import dut(y|ies)|customs levy/i,
  category: "Economy",
  prediction: "Market volatility likely in next 24-48h"
}
```

#### 地图数据配置 (`config/map.ts`)

包含多种地理数据，用于在 D3 世界地图上标注：

| 数据类型 | 数量 | 示例 |
|----------|------|------|
| 热点城市 | 16 | 基辅（威胁等级：high）、台北（medium）|
| 冲突区 | 6 | 乌克兰东部、加沙、也门 |
| 海上咽喉 | 7 | 霍尔木兹海峡、马六甲海峡 |
| 军事基地 | 9 | 拉姆施泰因、迪戈加西亚 |
| 核设施 | 7 | 纳坦兹、宁边 |
| 海底电缆登陆点 | 10 | 各大洲关键节点 |

### 3.3 数据获取子系统详细设计

#### GDELT 新闻获取 (`api/news.ts`)

GDELT（Global Database of Events, Language, and Tone）是一个免费的全球新闻数据库。

**查询构造**：
```
基础 URL: https://api.gdeltproject.org/api/v2/doc/doc
参数：
  query    = 按分类的关键词组合
  format   = json
  maxrecords = 50
  timespan   = 24h（最近24小时）
  sort     = DateDesc（最新的在前）
```

**数据富化流程**：
```
原始 GDELT 数据
    │
    ▼
基本转换（字段映射）
    │
    ├── isAlert = containsAlertKeyword(title)
    │   检查标题是否包含 21 个警报关键词中的任意一个
    │   如 "war", "nuclear", "attack", "assassination" 等
    │
    ├── region = detectRegion(title)
    │   检查标题中的地名，判断属于哪个地区
    │   EUROPE / MENA / APAC / AMERICAS / AFRICA
    │
    └── topics = detectTopics(title)
        检查标题关键词，标记涉及的话题
        CYBER / NUCLEAR / CONFLICT / INTEL / DEFENSE / DIPLO
```

#### 市场数据获取 (`api/markets.ts`)

**股市指数的间接获取方式**：

Finnhub 免费版不直接支持指数（如 ^DJI），所以用 ETF 作为代理：

```
^DJI  (道琼斯)  → 用 DIA  (追踪道琼斯的 ETF)
^GSPC (标普500) → 用 SPY  (追踪标普的 ETF)
^IXIC (纳斯达克) → 用 QQQ  (追踪纳指的 ETF)
^RUT  (罗素2000) → 用 IWM  (追踪罗素的 ETF)
```

**加密货币获取**：
```
CoinGecko API (免费，无需认证)
GET /api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&...

返回：
{
  "bitcoin": {
    "usd": 42000,
    "usd_24h_change": 2.5,
    "usd_market_cap": 820000000000
  },
  ...
}
```

#### FRED 数据获取 (`api/fred.ts`)

从美联储 FRED API 获取三个关键经济指标：

```
1. 联邦基金利率 (FEDFUNDS)
   → 美联储设定的基准利率
   → 直接影响所有贷款利率

2. CPI 通胀率 (CPIAUCSL)
   → 获取最近 14 个月数据
   → 手动计算同比变化率（今年 vs 去年同月）

3. 10 年期国债收益率 (DGS10)
   → 经济健康的"温度计"
   → 收益率上升通常意味着经济预期改善
```

### 3.4 服务韧性子系统详细设计

#### CacheManager 详细设计

```
┌─────────────────────────────────────────┐
│            CacheManager                  │
│                                         │
│  ┌─────────────┐   ┌────────────────┐  │
│  │   L1 内存    │   │  L2 localStorage│  │
│  │  Map<K,V>   │   │  sm_xxx = {...} │  │
│  │  最多 100 条 │   │  无数量限制     │  │
│  │  页面关闭清空│   │  持久保存       │  │
│  └──────┬──────┘   └───────┬────────┘  │
│         │                   │           │
│         ▼                   ▼           │
│  get(key):                              │
│  1. 查 L1 → 命中且未过期 → 返回        │
│  2. 查 L2 → 命中且未过期 → 提升到L1→返回│
│  3. 都没有 → 返回 null                  │
│                                         │
│  set(key, data, ttl):                   │
│  1. 写入 L1（如果满了，删除最老的）      │
│  2. 写入 L2（如果存储满了，清理 50%）    │
│                                         │
│  stale-while-revalidate:                │
│  - 数据有两个寿命：新鲜期 = TTL         │
│  -                 陈旧期 = 2 × TTL     │
│  - 新鲜期内：直接返回                   │
│  - 陈旧期内：返回旧数据 + 后台刷新      │
│  - 超过陈旧期：视为过期                 │
└─────────────────────────────────────────┘
```

**localStorage 键设计**：
- 前缀 `sm_` + DJB2 哈希值
- 示例：`sm_2934857` 对应缓存键 `gdelt:politics:latest`
- 使用哈希而非原始键，避免 localStorage 的键长度限制

#### CircuitBreaker 状态机

```
                    连续失败 N 次
     ┌──────┐ ──────────────────▶ ┌──────┐
     │ 关闭  │                     │ 打开  │
     │CLOSED│ ◀────────────────── │ OPEN │
     └──────┘    测试成功          └──┬───┘
        ▲                            │
        │        等待超时后           │
        │    ┌───────┐               │
        └────│ 半开  │◀──────────────┘
     测试成功│HALF   │
             │OPEN   │──────────────▶ 回到 OPEN
             └───────┘   测试失败

各服务的配置：
┌────────────┬──────────────┬──────────────┐
│ 服务       │ 失败阈值      │ 恢复超时      │
├────────────┼──────────────┼──────────────┤
│ GDELT      │ 2 次          │ 60 秒        │
│ CoinGecko  │ 3 次          │ 120 秒       │
│ FRED       │ 3 次          │ 60 秒        │
│ CORS 代理  │ 5 次          │ 120 秒       │
└────────────┴──────────────┴──────────────┘
```

#### ServiceClient 请求流程

```
serviceClient.request(serviceId, endpoint, options)
    │
    ▼
[1] 查缓存 ──── 命中且新鲜 → 直接返回 ✅
    │
    │ 命中但陈旧
    ├──────────────▶ 返回旧数据 + 启动后台刷新 ✅
    │
    │ 未命中
    ▼
[2] 查熔断器 ──── 已打开 → 尝试返回缓存 or 抛出错误 ❌
    │
    │ 未打开
    ▼
[3] 请求去重 ──── 已有相同请求 → 复用它的 Promise ✅
    │
    │ 无重复请求
    ▼
[4] 发送请求（带超时控制）
    │
    ├── 成功 → 更新缓存 → 通知熔断器 → 返回数据 ✅
    │
    └── 失败 → 重试（指数退避：1s, 2s, 4s...）
              │
              ├── 重试成功 → 同上 ✅
              │
              └── 全部重试失败
                  │
                  ├── 有旧缓存 → 返回旧数据 ✅
                  └── 无缓存 → 通知熔断器 → 抛出错误 ❌
```

### 3.5 状态管理子系统详细设计

#### News Store 内部结构

```typescript
// 状态结构
{
  categories: {
    politics:   { items: NewsItem[], loading: false, error: null, lastUpdated: Date },
    tech:       { items: NewsItem[], loading: false, error: null, lastUpdated: Date },
    finance:    { items: NewsItem[], loading: false, error: null, lastUpdated: Date },
    government: { items: NewsItem[], loading: false, error: null, lastUpdated: Date },
    ai:         { items: NewsItem[], loading: false, error: null, lastUpdated: Date },
    intel:      { items: NewsItem[], loading: false, error: null, lastUpdated: Date }
  }
}

// 派生数据（自动计算）
allNewsItems  = 所有分类的 items 合并并按时间排序
alerts        = allNewsItems.filter(item => item.isAlert === true)
isLoading     = 任意分类的 loading === true
hasErrors     = 任意分类的 error !== null
```

#### Settings Store — 面板管理

```typescript
{
  enabled: {
    map: true,
    news_politics: true,
    news_tech: true,
    markets: true,
    crypto: false,     // 用户可以关闭不需要的面板
    ...
  },
  order: ['map', 'news_politics', 'markets', ...],  // 拖拽排序
  sizes: { map: 'large', markets: 'medium', ... }   // 面板大小
}
```

用户设置持久化到 localStorage，下次打开页面自动恢复。

#### Monitors Store — 自定义监控

用户可以创建最多 20 个自定义关键词监控器：

```
用户创建监控器："中国芯片"
    │
    ▼
monitor = {
  id: "uuid-xxx",
  name: "中国芯片动态",
  keywords: ["china chip", "semiconductor", "华为"],
  enabled: true,
  matches: []
}
    │
    ▼
每次新闻刷新后，scanForMatches(allNewsItems) 自动运行
    │
    ▼
遍历所有新闻标题，检查是否包含 keywords 中的任意关键词
    │
    ▼
匹配的新闻填入 monitor.matches
    │
    ▼
MonitorsPanel 显示匹配结果
```

### 3.6 分析引擎详细设计

#### 关联检测算法

```
输入：allNewsItems（所有新闻条目）

步骤 1：模式匹配
  对每个新闻标题，测试 20 个关联主题的正则表达式
  记录：{ topic → [匹配的新闻列表] }

步骤 2：计算新兴模式
  过滤出匹配数 >= 3 的主题
  分级：
    3-4 次 → "emerging"（新兴）
    5-7 次 → "elevated"（升高）
    8+ 次  → "high"（高度关注）

步骤 3：计算势头
  维护一个按分钟的历史记录（保留 30 分钟）
  当前计数 vs 10分钟前的计数：
    差值 >= 4 → "surging"（飙升）
    差值 >= 2 → "rising"（上升）
    其他     → "stable"（稳定）

步骤 4：跨源关联
  统计每个主题被多少个不同的新闻源报道
  >= 3 个源报道同一主题 → 标记为跨源关联

步骤 5：预测信号
  综合评分 = 匹配次数 × 2 + 来源数 × 3 + 势头变化 × 5
  评分 >= 15 → 生成预测文本

  预测示例：
  - 关税主题得分 >= 15 → "未来 24-48 小时市场可能波动加剧"
  - 军事主题得分 >= 15 → "地区紧张局势可能进一步升级"
```

#### 叙事追踪算法

```
输入：allNewsItems

步骤 1：源分类
  将每个新闻源标记为：
  - fringe（边缘）：如 ZeroHedge, InfoWars
  - alternative（另类）：如 The Intercept, Jacobin
  - mainstream（主流）：如 BBC, CNN, NYT

步骤 2：叙事匹配
  16 个叙事模式（关键词匹配，不是正则）
  每个模式有严重级别：watch / warning / disinfo

步骤 3：穿越检测
  如果同一个叙事同时出现在 fringe 和 mainstream 源 →
  标记为 "fringe-to-mainstream"（叙事穿越）

  这是最重要的信号：
  表示一个最初只在小众渠道流传的说法正在被主流媒体采纳

步骤 4：分类输出
  ┌────────────────────┬────────────────────────────────┐
  │ fringe-to-mainstream │ 穿越信号 — 需重点关注          │
  │ emerging-fringe      │ 新兴边缘叙事 — 可能值得观察    │
  │ disinfo-signal       │ 虚假信息标记 — 已知不实叙事    │
  │ narrative-watch      │ 一般观察 — 低优先级            │
  └────────────────────┴────────────────────────────────┘
```

#### 主角分析算法

```
输入：allNewsItems

步骤 1：计数
  20 个人物，每人一个正则表达式
  遍历所有标题，累计每个人物的提及次数

步骤 2：排名
  按提及次数降序排列，取前 10

步骤 3：支配度计算
  dominance = min((count[#1] / count[#2] - 1) × 100, 100)

  例：
  - Trump 被提及 50 次，Musk 被提及 25 次
  - dominance = (50/25 - 1) × 100 = 100（满分）

  - Trump 被提及 30 次，Biden 被提及 28 次
  - dominance = (30/28 - 1) × 100 ≈ 7（势均力敌）
```

### 3.7 UI 子系统详细设计

#### 面板系统

所有面板共用 `Panel.svelte` 基础组件，提供统一的外观：

```
┌──────────────────────────────────────┐
│ ▸ 面板标题              [42] ⚡ 🔄   │  ← 标题栏：标题、计数、状态、刷新
├──────────────────────────────────────┤
│                                      │
│  面板内容（由子组件提供）              │
│                                      │
│  如果加载中 → 显示旋转动画            │
│  如果出错 → 显示错误消息              │
│  如果无数据 → 显示"暂无数据"          │
│                                      │
└──────────────────────────────────────┘
```

#### Dashboard 布局算法

使用 CSS `column-count` 实现瀑布流布局：

```
窗口宽度        列数     效果
< 600px         1        手机竖屏
600-899px       2        平板竖屏
900-1199px      3        笔记本
1200-1599px     4        桌面显示器
1600-1999px     5        宽屏
2000px+         6        超宽屏 / 多显示器
```

每个面板使用 `break-inside: avoid` 避免被拆分到两列中。

#### 引导流程

首次访问的用户会看到引导弹窗：

```
欢迎使用 Situation Monitor!
选择一个预设来快速开始：

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  新闻狂人    │  │  交易员      │  │  地缘政治    │
│  所有新闻面板 │  │  市场+金融   │  │  地图+冲突   │
└──────────────┘  └──────────────┘  └──────────────┘
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  情报分析    │  │  精简模式    │  │  全部开启    │
│  情报+分析面板│  │  核心面板    │  │  25个面板全开 │
└──────────────┘  └──────────────┘  └──────────────┘
```

选择后，对应的面板组合被启用，首次访问标记保存到 localStorage。

## 四、数据持久化设计

应用使用 localStorage 保存用户偏好，键名设计如下：

| 键名 | 内容 | 所属 Store |
|------|------|-----------|
| `panelSettings` | 面板开关、排列顺序 | settings |
| `refreshSettings` | 自动刷新配置 | refresh |
| `customMonitors` | 自定义监控器列表 | monitors |
| `onboardingComplete` | 是否已完成引导 | settings |
| `sm_*` | 数据缓存（API响应） | CacheManager |

## 五、安全性考量

### 已知问题

1. **API 密钥暴露**：Finnhub 和 FRED 的 API Key 通过环境变量注入，但最终会出现在构建产物中。这些是免费 API 的密钥，风险较低，但不是最佳实践。

2. **XSS 防护**：`utils/format.ts` 中有 `escapeHtml()` 函数，用于清理外部数据中的 HTML，防止跨站脚本攻击。

3. **无用户认证**：纯前端应用，没有用户系统，没有敏感操作，所以不需要认证。

## 六、性能设计

### 网络优化
- CORS 代理缓存减少重复请求
- 请求去重防止并发相同请求
- stale-while-revalidate 策略确保用户始终看到数据
- 分批请求避免 API 速率限制

### 渲染优化
- Svelte 编译时优化（只更新变化的 DOM）
- 面板折叠减少可见元素
- CSS `column-count` 比 JS 布局方案更高效

### 内存管理
- 缓存最大 100 条（L1）
- 关联分析历史只保留 30 分钟
- 刷新历史只保留最近 10 次

## 七、扩展指南

### 添加一个新的新闻源

1. 在 `config/feeds.ts` 中添加：
```typescript
{ name: '新华社', url: 'http://...rss', category: 'politics' }
```
完成。不需要改其他文件。

### 添加一个新的关联主题

1. 在 `config/analysis.ts` 的 `CORRELATION_TOPICS` 中添加：
```typescript
{
  name: "Supply Chain Crisis",
  pattern: /supply chain|shipping delay|port congestion/i,
  category: "Economy",
  prediction: "Consumer goods availability may be impacted"
}
```
完成。关联检测引擎会自动使用新主题。

### 添加一个新面板

1. 在 `config/panels.ts` 注册面板 ID
2. 在 `components/panels/` 创建新的 Svelte 组件
3. 在 `+page.svelte` 中导入并添加到 Dashboard
4. （可选）在 `config/presets.ts` 中将新面板加入预设

### 接入一个新的 API

1. 在 `api/` 目录创建新的获取函数
2. 在 `stores/` 目录创建对应的 Store（如果需要全局状态）
3. 在 `services/registry.ts` 注册服务配置（超时、重试、缓存策略）
4. 在 `+page.svelte` 的 `initialLoad()` 中调用新的获取函数
