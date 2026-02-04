# Situation Monitor

即時整合全球市場數據、美聯儲指標與重大事件的一站式宏觀局勢儀表板。

## 功能特色

### 📊 市場數據
- **股票指數**：S&P 500、NASDAQ、道瓊斯、羅素 2000
- **產業表現**：科技、醫療、金融、能源等 11 大產業
- **商品期貨**：黃金、原油、天然氣、銀、銅、VIX 波動率
- **加密貨幣**：比特幣、以太坊、Solana 等主流幣種

### 📈 經濟指標
- **聯邦基金利率**（Fed Funds Rate）
- **消費者物價指數**（CPI 年增率）
- **10 年期公債殖利率**
- **聯準會新聞**：貨幣政策、鮑威爾演講、證詞與公告

### 🌍 局勢監控
- **台海局勢**：解放軍活動、半導體供應鏈
- **烏克蘭戰爭**：前線更新、軍事援助
- **伊朗危機**：抗爭運動、核計劃
- **委內瑞拉**：政治動盪、石油制裁
- **格陵蘭**：資源競爭、獨立運動

### 🔍 新聞分類
- 政治、科技、財經、政府、AI、國安

### 🐋 進階數據
- 鯨魚錢包追蹤（巨鯨地址交易）
- Polymarket 預測市場
- 政府合約招標
- 裁員資訊

## 快速開始

### 安裝依賴

```bash
npm install
```

### 環境配置

複製範例環境檔案：

```bash
cp .env.example .env
```

編輯 `.env` 填入 API Key：

```env
# Finnhub（市場數據）- 免費註冊：https://finnhub.io/
VITE_FINNHUB_API_KEY=your_finnhub_key

# FRED（美聯儲數據）- 免費註冊：https://fred.stlouisfed.org/
VITE_FRED_API_KEY=your_fred_key
```

### 開發模式

```bash
npm run dev
```

訪問 http://localhost:5173

### 生產建置

```bash
npm run build
```

產出結果會在 `build/` 目錄。

### 預覽建置

```bash
npm run preview
```

## 技術棧

- **框架**：SvelteKit + Svelte 5
- **樣式**：Tailwind CSS
- **類型**：TypeScript
- **建置工具**：Vite
- **部署平台**：Vercel（Static Adapter）

## 數據來源

| 服務 | 用途 | 免費額度 |
|------|------|----------|
| Finnhub | 股票、產業、商品 | 60 次/分鐘 |
| FRED | 聯準會經濟數據 | 無限制 |
| CoinGecko | 加密貨幣價格 | 有限制 |
| GDELT | 全球新聞事件 | 無需 API Key |
| Federal Reserve | 聯準會新聞 RSS | 無需 API Key |

## 部署到 Vercel

1. 在 Vercel 匯入專案
2. 在專案 Settings → Environment Variables 添加環境變數
3. 自動部署完成

## 授權

MIT License
