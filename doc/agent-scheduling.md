# Situation Monitor - 调度逻辑与数据交互流程

> **重要说明**：这个项目本身**不是一个 AI Agent**，它**不与大模型交互**。它是一个纯前端的数据聚合与分析仪表盘。它的"智能"来自基于规则的模式匹配（正则表达式 + 关键词检测），而不是 AI 大模型。

## 一、调度逻辑概述

### 什么是"调度"？

在这个项目中，"调度"指的是：**决定什么时候、以什么顺序去获取哪些数据**。

因为项目需要从多个外部 API 获取数据（新闻、股市、加密货币、政府数据等），不能同时一次性发出所有请求（否则会被 API 封禁或导致浏览器卡顿），所以需要一个调度策略。

### 调度发生在哪里？

调度逻辑分布在两个地方：
1. **`src/routes/+page.svelte`**：实际执行数据加载的入口
2. **`src/lib/stores/refresh.ts`**：刷新状态管理和自动刷新定时器

## 二、初始加载流程

当用户首次打开页面时，调用链如下：

```
用户打开页面
    │
    ▼
+page.svelte 的 onMount() 触发
    │
    ▼
initialLoad() 函数执行
    │
    ├──▶ loadNews()           ←── 并行执行
    ├──▶ loadMarkets()        ←── 并行执行
    ├──▶ loadMiscData()       ←── 并行执行
    ├──▶ loadWorldLeaders()   ←── 并行执行
    └──▶ loadFedData()        ←── 并行执行
```

### 各加载函数内部的执行细节

#### loadNews() — 新闻加载
```
loadNews()
    │
    ▼
fetchAllNews()  — 内部按分类依次获取，不是并行
    │
    ├── fetchCategoryNews("politics")   ── 等 500ms ──▶
    ├── fetchCategoryNews("tech")       ── 等 500ms ──▶
    ├── fetchCategoryNews("finance")    ── 等 500ms ──▶
    ├── fetchCategoryNews("government") ── 等 500ms ──▶
    ├── fetchCategoryNews("ai")         ── 等 500ms ──▶
    └── fetchCategoryNews("intel")

    每个分类的获取流程：
    ┌─────────────────────────────────────────────┐
    │ 1. 构造 GDELT API 查询 URL                   │
    │ 2. 通过 CORS 代理发送请求                     │
    │ 3. 解析 JSON 响应                             │
    │ 4. 对每条新闻进行"富化"处理：                  │
    │    - 检查标题是否包含警报关键词                 │
    │    - 检测新闻涉及的地区                        │
    │    - 检测新闻涉及的话题                        │
    │ 5. 写入 news store                            │
    └─────────────────────────────────────────────┘
```

**为什么要顺序获取？** 因为 GDELT API 有速率限制，同时发 6 个请求可能触发封禁。500ms 延迟是一种"礼貌性"限速。

#### loadMarkets() — 市场数据加载
```
loadMarkets()
    │
    ▼
fetchAllMarkets()  — 内部四个子任务并行执行
    │
    ├──▶ fetchIndices()           （股市指数：道琼斯、标普500等）
    ├──▶ fetchSectorPerformance() （12个板块 ETF）
    ├──▶ fetchCommodities()       （黄金、石油等）
    └──▶ fetchCryptoPrices()      （BTC、ETH、SOL）
```

**为什么这些可以并行？** 因为它们请求的是不同的 API 端点（Finnhub vs CoinGecko），不会互相影响。

#### loadWorldLeaders() — 世界领导人新闻
```
loadWorldLeaders()
    │
    ▼
fetchWorldLeaders()  — 20 个领导人，分批获取
    │
    ├── 第 1 批：leader[0-4]  ── 5 个并行 ── 等 300ms ──▶
    ├── 第 2 批：leader[5-9]  ── 5 个并行 ── 等 300ms ──▶
    ├── 第 3 批：leader[10-14] ── 5 个并行 ── 等 300ms ──▶
    └── 第 4 批：leader[15-19] ── 5 个并行
```

#### loadFedData() — 美联储数据
```
loadFedData()
    │
    ├──▶ fetchFedIndicators()  ── 并行
    │      ├── FRED: 联邦基金利率
    │      ├── FRED: CPI（通胀）
    │      └── FRED: 10年期国债
    │
    └──▶ fetchFedNews()        ── 并行
           └── 解析 5 个 Fed RSS 源
```

#### loadMiscData() — 杂项数据
```
loadMiscData()
    │
    ├──▶ fetchPolymarket()        ── 返回模拟数据
    ├──▶ fetchWhaleTransactions() ── 返回模拟数据
    ├──▶ fetchGovernmentContracts()── 返回模拟数据
    └──▶ fetchLayoffs()           ── 返回模拟数据
```

**注意**：这些目前都是硬编码的模拟数据，不会真正发送网络请求。

## 三、刷新调度机制

### 手动刷新

用户点击 Header 上的刷新按钮时：

```
用户点击刷新
    │
    ▼
handleRefresh()
    │
    ├── refresh.startRefresh()   ← 记录开始时间
    │
    ├── 并行执行：
    │   ├── loadNews()
    │   └── loadMarkets()
    │
    └── refresh.endRefresh()     ← 记录结束时间、成功/失败
```

### 自动刷新

```
页面加载完成
    │
    ▼
refresh.setupAutoRefresh(handleRefresh)
    │
    ▼
内部创建 setInterval
    │
    ▼
每 1 小时自动调用 handleRefresh()
    │
    ▼
页面卸载时 → refresh.stopAutoRefresh() → clearInterval
```

自动刷新的设置保存在 localStorage 中，包括：
- 是否启用自动刷新
- 刷新间隔（默认 1 小时）
- 上次刷新时间

### 三阶段设计（已定义但未完全启用）

`refresh.ts` 中定义了一个三阶段刷新策略：

```
阶段 1 "critical"（0ms 延迟）：  新闻 + 市场 + 警报
阶段 2 "secondary"（2s 延迟）：  加密货币 + 大宗商品 + 情报
阶段 3 "tertiary"（4s 延迟）：   合同 + 鲸鱼 + 裁员 + Polymarket
```

**设计意图**：优先加载最重要的数据（新闻和市场），次要数据稍后加载，避免一次性发出太多请求。

**当前状态**：阶段定义存在于代码中，但 `+page.svelte` 的实际刷新逻辑并没有使用阶段延迟——它直接并行加载所有数据。这意味着三阶段策略是一个**已设计但尚未完全实现的功能**。

## 四、数据交互流程

### 与外部 API 的交互

这个项目作为纯前端应用，**所有数据交互都发生在用户浏览器中**。没有后端服务器。

#### 交互的外部 API

| API | 用途 | 认证 | 代理 |
|-----|------|------|------|
| GDELT Doc API | 全球新闻搜索 | 无 | 需要 CORS 代理 |
| Finnhub | 美股行情 | API Key | 直连 |
| CoinGecko | 加密货币价格 | 无 | 需要 CORS 代理 |
| FRED | 美联储经济数据 | API Key | 直连 |
| 各 RSS 源 | 新闻/情报 | 无 | 需要 CORS 代理 |

#### CORS 代理是什么？为什么需要？

浏览器有一个安全限制叫"同源策略"：网页只能请求自己域名下的 API。如果你的网站是 `example.com`，你不能直接请求 `api.gdelt.org`。

**解决方案**：部署一个 Cloudflare Worker 作为中间人：

```
浏览器 ──▶ CORS 代理（Cloudflare Worker）──▶ 目标 API
  │                                              │
  │◀──────── 数据原路返回 ◀──────────────────────┘
```

项目配置了两个代理地址（主 + 备），如果第一个失败会自动切到第二个。

#### 一次完整的新闻获取交互

以获取"政治"分类新闻为例：

```
1. 构造 URL
   https://api.gdeltproject.org/api/v2/doc/doc?query=...&format=json&maxrecords=50

2. 通过 CORS 代理发送
   https://your-proxy.workers.dev/?url=https://api.gdeltproject.org/...

3. 收到 JSON 响应
   {
     "articles": [
       {
         "title": "US announces new sanctions...",
         "url": "https://...",
         "source": "bbc.co.uk",
         "seendate": "20250130T120000Z",
         "socialimage": "https://...",
         "domain": "bbc.co.uk",
         "language": "English"
       },
       ...
     ]
   }

4. 转换成内部格式 NewsItem
   {
     title: "US announces new sanctions...",
     link: "https://...",
     source: "bbc.co.uk",
     pubDate: "2025-01-30T12:00:00Z",
     category: "politics",
     isAlert: true,           ← 标题包含"sanctions"
     region: "AMERICAS",      ← 关键词检测
     topics: ["DIPLO"]        ← 话题检测
   }

5. 写入 news store → UI 自动更新
```

### 分析引擎的数据处理

分析引擎**不与任何外部 API 交互**，它完全在浏览器内运行，输入是已获取的新闻数据。

```
所有新闻数据 (allNewsItems)
    │
    ├──▶ analyzeCorrelations(allNewsItems)
    │      输入：所有新闻标题
    │      处理：用 20 个正则模式匹配标题
    │      输出：关联模式 + 势头信号 + 跨源关联 + 预测
    │
    ├──▶ analyzeNarratives(allNewsItems)
    │      输入：所有新闻（标题 + 来源）
    │      处理：匹配 16 个叙事模式，按来源分类
    │      输出：边缘叙事 + 叙事穿越 + 虚假信息信号
    │
    └──▶ calculateMainCharacter(allNewsItems)
           输入：所有新闻标题
           处理：用 20 个人名正则统计提及次数
           输出：排名前 10 的人物 + 支配度分数
```

## 五、没有 AI 大模型交互

需要明确强调：**这个项目不使用任何 AI/大模型**。

它的"智能分析"完全基于：
- **正则表达式**匹配（关联检测、人物计数）
- **关键词匹配**（警报检测、地区检测、话题检测、叙事追踪）
- **数学计算**（势头变化、支配度评分、预测评分）
- **规则引擎**（阈值判断：3+ 次提及 = 新兴、8+ 次 = 高度关注）

这些分析方法简单但有效，不需要 GPU 或 API 调用，完全在用户浏览器中即时运行。

## 六、完整的生命周期时序图

```
时间线 ──────────────────────────────────────────────────────────▶

T=0s    用户打开页面
        │
        ├── onMount() 触发
        ├── 检查是否首次访问 → 是 → 显示引导弹窗
        ├── 加载 localStorage 中的设置
        │
T=0.1s  initialLoad() 开始
        │
        ├──▶ loadNews() 开始       ──────────────────────────▶ T≈4s 完成
        │    （6个分类 × 500ms间隔 ≈ 3秒 + 网络时间）
        │
        ├──▶ loadMarkets() 开始    ──────────▶ T≈1.5s 完成
        │    （4个子任务并行）
        │
        ├──▶ loadMiscData() 开始   ▶ T≈0.2s 完成（模拟数据，几乎即时）
        │
        ├──▶ loadWorldLeaders()    ──────────────────▶ T≈3s 完成
        │    （4批 × 300ms间隔 + 网络时间）
        │
        └──▶ loadFedData() 开始    ──────▶ T≈2s 完成

T≈4s    所有数据加载完成
        │
        ├── 分析引擎运行（毫秒级）
        ├── UI 完全渲染
        └── setupAutoRefresh() 启动定时器

T=1hr   自动刷新触发
        │
        └── handleRefresh() → loadNews() + loadMarkets()

T=2hr   自动刷新再次触发
        ...
```

## 七、错误处理策略

当数据获取失败时，系统有多层防护：

```
请求失败
    │
    ├── 第 1 层：重试
    │   服务配置决定重试次数（1-2 次）
    │   使用指数退避：1s → 2s → 4s（+ 随机抖动）
    │
    ├── 第 2 层：CORS 代理切换
    │   如果主代理失败，自动切到备用代理
    │
    ├── 第 3 层：缓存回退
    │   如果有旧数据（即使已过期），显示旧数据
    │
    ├── 第 4 层：熔断器
    │   如果某个 API 连续失败 N 次，暂时停止请求该 API
    │   避免持续轰炸一个已经挂掉的服务
    │
    └── 第 5 层：优雅降级
        对应面板显示错误消息，其他面板正常工作
        不会因为一个 API 挂了导致整个页面白屏
```
