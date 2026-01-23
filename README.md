# 🌍 Situation Monitor (3D Edition)

> A real-time global intelligence dashboard for monitoring news narratives, geopolitical conflicts, economic indicators, and market trends.

| License | Framework | Styling | Language |
| :---: | :---: | :---: | :---: |
| ![License](https://img.shields.io/badge/license-MIT-blue.svg) | ![Svelte](https://img.shields.io/badge/svelte-%23f1413d.svg?style=flat&logo=svelte&logoColor=white) | ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white) | ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white) |


![Situation Monitor Screenshot](https://i.imgur.com/sCYKoAn.png)

## 🚀 Overview

**Situation Monitor** is an open-source intelligence dashboard designed to aggregate and visualize complex data streams. It replaces traditional 2D maps with an interactive **3D Globe** and provides a "command center" view of the world.

This project aggregates data from **GDELT** (Global News), **Finnhub** (Stocks), **CoinGecko** (Crypto), and **FRED** (Federal Reserve Economic Data) to provide a holistic view of the current global situation.

---

## ✨ Key Features

### 🌐 3D Interactive Globe
*   **Real-time Visualization:** Built with `globe.gl`, rendering Conflict Zones, Nuclear Sites, Military Bases, and Submarine Cables.
*   **Mini-Dashboard:** An integrated "Heads-Up Display" next to the globe showing:
    *   **Local Time & Weather** for major global cities.
    *   **Sector Heatmap:** Live performance of US market sectors.
    *   **Markets & Crypto:** Live prices for Dow, S&P 500, BTC, ETH, etc.
    *   **Fed Data:** Color-coded cards for Interest Rates, Inflation (CPI), and the "Money Printer" (Total Assets).
    *   **Layoffs Tracker:** Recent tech layoff statistics.

### 🧠 Narrative Intelligence
*   **Pattern Analysis:** Detects emerging keywords across thousands of news articles using GDELT.
*   **Main Character Energy:** Algorithms to detect who is dominating the news cycle (e.g., "Elon Musk", "Trump").
*   **Narrative Tracker:** Tracks how fringe theories cross over into mainstream media.
*   **Custom Monitors:** Create your own keyword watchers (e.g., "Semiconductors", "Taiwan Strait").

### 📊 Economic & Fed Data
*   **Federal Reserve Integration:** Direct connection to the FRED API.
*   **Status Indicators:** Automatic labeling of economic data (e.g., `[Restrictive]` rates, `[High Inflation]`).
*   **Money Printer:** Visual gauge of the Federal Reserve's balance sheet expansion/contraction.

### 🎨 UI/UX
*   **Theme Support:** Toggle between **Light** and **Dark** modes.
*   **Responsive:** Grid layout that adapts to different screen sizes.
*   **Settings:** Persisted user preferences via LocalStorage.

---

## 🛠️ Tech Stack

*   **Framework:** [SvelteKit](https://kit.svelte.dev/) (Svelte 5 Runes)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Visualization:** Globe.gl (Three.js), D3.js
*   **Data Sources:**
    *   **News:** The GDELT Project (Free)
    *   **Economy:** St. Louis Fed (FRED API)
    *   **Markets:** Finnhub & CoinGecko
    *   **Weather:** Open-Meteo

---

## ⚡ Getting Started

### 1. Prerequisites
*   Node.js (v18 or higher)
*   npm or pnpm

### 2. Clone the Repository
```bash
git clone https://github.com/mm-mazhar/situation-monitor.git
cd situation-monitor

### 3. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory. You will need API keys for financial and economic data.

```bash
cp .env.example .env
# or
pnpm dev
```
| Variable | Description | Where to get it |
| :--- | :--- | :--- |
| `VITE_FINNHUB_API_KEY` | For Stocks/Commodities | [Finnhub.io](https://finnhub.io/) (Free) |
| `VITE_FRED_API_KEY` | For Fed Rates/Inflation | [St. Louis Fed](https://fredaccount.stlouisfed.org/apikeys) (Free) |

### 5. Run Development Server

```bash
npm run dev
```

Open your browser to http://localhost:5173.

## 🏗️ Project Structure
```
src/
├── lib/
│   ├── analysis/       # Algorithms for news pattern detection
│   ├── api/            # API clients (FRED, GDELT, Markets)
│   ├── components/
│   │   ├── common/     # Reusable UI (Badges, Panels)
│   │   ├── panels/     # Dashboard Widgets (GlobePanel, FedPanel, etc.)
│   │   └── modals/     # Settings & Input modals
│   ├── config/         # Static data (Hotspots, Leaders, Feeds)
│   └── stores/         # Svelte stores (State management)
└── routes/             # SvelteKit pages
```

## 🤝 Contributing
Contributions are welcome! This project is a fork of the original situation-monitor.

1. Fork the Project
2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit your Changes (git commit -m 'Add some AmazingFeature')
4. Push to the Branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## 📄 License
Distributed under the MIT License. See LICENSE for more information.

## 👏 Acknowledgements
- Original concept and codebase by [hipcityreg](https://github.com/hipcityreg/situation-monitor).
- Data provided by The GDELT Project.