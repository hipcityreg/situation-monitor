# Situation Monitor v2.1.0 - Release Notes

## Release Date: 2026-02-12

---

## ✨ New Features

### 1. Fullscreen Mode
Added fullscreen toggle button in the header (top-right, next to language switcher).

**Features:**
- Click ⛶ button to enter fullscreen mode
- Hides browser URL bar and bookmarks for immersive experience
- Click again or press ESC to exit
- Supports both keyboard (F11) and button toggle

**Location:** Header component (`src/lib/components/layout/Header.svelte`)

**i18n Keys:**
- `header.enterFullscreen`: "Fullscreen" / "全屏"
- `header.exitFullscreen`: "Exit Fullscreen" / "退出全屏"

---

### 2. Real-time Treasury Yield Data (FRED API)
Implemented server-side proxy to bypass CORS restrictions.

**Architecture:**
```
Browser → Nginx (/api/fred/) → FRED API ✅
```

**Data Source:** FRED (Federal Reserve Economic Data)
- 2-Year Treasury (DGS2)
- 10-Year Treasury (DGS10)
- Real-time updates with 1-hour cache

**Nginx Configuration:**
```nginx
location /api/fred/ {
    proxy_pass https://api.stlouisfed.org/fred/;
    add_header Access-Control-Allow-Origin "*";
}
```

---

### 3. MOVE Index Fallback
Bond market volatility index with multi-source fallback.

**Data Sources (in priority order):**
1. Yahoo Finance (via CORS proxy)
2. Finnhub (paid subscription required)
3. Demo data (fallback)

**Location:** `src/lib/api/moveIndex.ts`

---

### 4. Client-side Caching System
Implemented localStorage-based caching to reduce API calls.

**Cache TTL Configuration:**
| Data Type | TTL | Key |
|-----------|-----|-----|
| Treasury Yields | 1 hour | `treasury_yields_daily_YYYY-MM-DD` |
| MOVE Index | 30 min | `move_index_hourly` |
| Fear & Greed | 1 hour | `fear_greed_hourly` |
| Stock Quotes | 15 min | `stock_quote_{symbol}` |
| Earnings Calendar | 6 hours | `earnings_calendar` |

**Location:** `src/lib/utils/cache.ts`

**Features:**
- Automatic expiration handling
- Cache statistics tracking
- Daily cache keys for time-sensitive data
- Force refresh capability

---

### 5. API Key Configuration
Added support for multiple financial data sources.

**Environment Variables (.env):**
```env
# FRED API (Treasury Yields)
VITE_FRED_API_KEY=05fb8bccd04ed22d392e7d8b5b9c6979

# Alpha Vantage (Stock Quotes, Earnings)
VITE_ALPHA_VANTAGE_API_KEY=PZS3GFM8S4GRCA0A

# Finnhub (Market Data)
VITE_FINNHUB_API_KEY=d662601r01qk7t4mt96gd662601r01qk7t4mt970
```

---

### 6. NVIDIA Earnings Countdown (Fixed)
Corrected earnings date calculation.

**Before:** Static 45 days
**After:** Dynamic calculation based on actual earnings date (Feb 25, 2026)

**Location:** `src/lib/components/panels/AiInvestmentChainPanel.svelte`

---

## 🔧 Technical Improvements

### Nginx Configuration
Updated to support:
- Static file serving for SPA
- API reverse proxy for FRED
- Proper CORS headers
- Gzip compression
- Cache headers

**Config Location:** `/etc/nginx/sites-available/situation-monitor`

### Data Source Indicators
Added visual indicators showing data source:

| Badge | Meaning |
|-------|---------|
| 🟢 **LIVE** | Real-time API data |
| 🟡 **Yahoo** | Yahoo Finance data |
| 🟠 **API** | Finnhub/Alpha Vantage |
| ⚪ **Demo** | Fallback demo data |

**Affected Panels:**
- YieldCurvePanel
- MoveIndexPanel

---

## 📁 File Changes

### New Files
```
src/lib/api/moveIndex.ts      # MOVE Index API with Yahoo Finance fallback
src/lib/utils/cache.ts        # Client-side caching system
src/routes/api/treasury/       # Server-side proxy for FRED (removed, using Nginx now)
```

### Modified Files
```
src/lib/components/layout/Header.svelte           # Added fullscreen button + onMount import
src/lib/api/treasury.ts                        # Updated to use Nginx proxy + caching
src/lib/api/moveIndex.ts                       # New MOVE Index implementation
src/lib/api/index.ts                            # Added exports
src/lib/i18n/locales/en.json                   # Added fullscreen i18n keys
src/lib/i18n/locales/zh.json                   # Added fullscreen i18n keys
src/lib/components/panels/MoveIndexPanel.svelte # Updated to use new API
```

### Deployment
```
/etc/nginx/sites-available/situation-monitor  # Updated with /api/fred/ proxy
```

---

## 🚀 Deployment Commands

```bash
# Build
cd /root/clawd/situation-monitor
npm run build

# Deploy
sudo rm -rf /var/www/situation-monitor/*
sudo cp -r build/* /var/www/situation-monitor/
sudo chown -R www-data:www-data /var/www/situation-monitor

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 API Keys (Production)

| Service | Key | Status |
|---------|-----|--------|
| FRED | `05fb8bccd04ed22d392e7d8b5b9c6979` | ✅ Active |
| Alpha Vantage | `PZS3GFM8S4GRCA0A` | ✅ Active |
| Finnhub | `d662601r01qk7t4mt96gd...` | ✅ Active |

---

## 📊 Data Sources Summary

| Panel | Data Source | Status |
|-------|------------|--------|
| Yield Curve | FRED API (via Nginx proxy) | ✅ LIVE |
| Fear & Greed | alternative.me | ✅ LIVE |
| MOVE Index | Yahoo Finance / Demo | ⚠️ Fallback |
| NVIDIA Earnings | Alpha Vantage / Dynamic Calc | ✅ LIVE |
| Stock Quotes | Finnhub / Alpha Vantage | ✅ LIVE |
| Fed Countdown | Static (FOMC Schedule) | ✅ LIVE |

---

## 🐛 Bug Fixes

1. **onMount Import Error** - Added missing `import { onMount }` in Header.svelte
2. **CORS Restriction** - Implemented Nginx reverse proxy for FRED API
3. **NVIDIA Earnings Date** - Fixed from static 45 days to dynamic calculation
4. **Cache Key Collision** - Added daily prefixes for time-sensitive data
5. **SPA Routing** - Fixed Nginx config for static asset serving

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| v2.1.0 | 2026-02-12 | Fullscreen, FRED proxy, caching, MOVE fallback |
| v2.0.0 | 2026-02-11 | Initial release with macro panels |

---

## 🎯 Known Limitations

1. **MOVE Index** - Free APIs limited; using demo data as fallback
2. **Rate Limits** - Alpha Vantage (25 calls/day), Finnhub (60 calls/min)
3. **CORS** - Some external APIs blocked from browser; using Nginx proxy

---

## 📞 Support

- **Repository:** https://github.com/corwien/situation-monitor
- **Deployment:** http://66.42.42.182/
- **Issues:** Report via GitHub Issues

---

*Generated: 2026-02-12 UTC*
