# API 配置指南

## 需要的API

### 1. Finnhub API（市场数据）
**用途**：股票指数、商品价格、加密货币数据

**申请步骤**：
1. 访问 https://finnhub.io/
2. 点击 "Get free API key" 注册账号
3. 在Dashboard中复制API Key
4. 添加到GitHub Secrets：
   - 进入仓库 Settings > Secrets and variables > Actions
   - 点击 "New repository secret"
   - Name: `VITE_FINNHUB_API_KEY`
   - Value: 你的API Key

**免费额度**：60次/分钟

---

### 2. FRED API（美联储经济数据）
**用途**：美联储利率、CPI、国债收益率

**申请步骤**：
1. 访问 https://fred.stlouisfed.org/docs/api/api_key.html
2. 点击 "Request API Key"
3. 填写表单（需要邮箱验证）
4. 收到API Key后添加到GitHub Secrets：
   - Name: `VITE_FRED_API_KEY`
   - Value: 你的API Key

**免费额度**：无限制

---

### 3. GDELT（新闻数据）
**用途**：全球新闻数据

**特点**：
- 无需API Key
- 通过CORS代理访问
- 可能受网络环境影响

---

## GitHub Secrets 配置

配置路径：
```
GitHub Repository > Settings > Secrets and variables > Actions > New repository secret
```

需要添加的Secrets：
- `VITE_FINNHUB_API_KEY` - Finnhub API密钥
- `VITE_FRED_API_KEY` - FRED API密钥

---

## 本地开发配置

创建 `.env` 文件：
```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env 文件，填入你的API密钥
VITE_FINNHUB_API_KEY=your_finnhub_api_key
VITE_FRED_API_KEY=your_fred_api_key
```

---

## 注意事项

1. **安全性**：API密钥存储在GitHub Secrets中，不会暴露在代码中
2. **构建时注入**：GitHub Actions构建时会自动注入密钥到环境变量
3. **免费额度**：注意API调用频率，避免超出免费额度
4. **备用方案**：如果API不可用，部分面板会显示空状态
