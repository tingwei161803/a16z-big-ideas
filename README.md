# a16z 科技大點子圖鑑 · Big Ideas Explorer

把 Andreessen Horowitz(a16z)2025 與 2026 的 **96 個科技大點子**整理、翻譯成一個**多區塊互動圖鑑**:統計總覽、現況查核、可排序資料表、分類導覽,中英文全頁切換。資料整理自 a16z 官方的 Big Ideas 系列文章,本站為非官方專案。

> **版型**:不採用卡片牆,而是參考多區塊資料站的做法,把同一批資料用最適合的呈現方式分區展開。

## 🔗 線上版 / Live

| | 網址 |
|---|---|
| 圖鑑 | **https://a16z-big-ideas.peteraim.com/** |
| 直接看某個點子 | 例如 `…/#2025-the-resurgence-of-nuclear`(每個預測都有專屬連結) |

## ✨ 功能特色

- 📊 **統計總覽** — 各分類預測數(長條)、年份分布(甜甜圈)、以及「分類 × 年份」熱力圖,一眼看出 a16z 的重心
- 🧾 **現況查核** — 6 個旗艦預測附上「到 2025–26 實際發生了什麼」的查證摘要與來源連結
- 🗂 **可排序資料表** — 96 個預測攤成一張表,點欄位標題排序(年份 / 分類 / 標題 / 作者 / 查核),手機自動攤平成卡片
- 🔎 **即時搜尋 + 雙軸篩選** — 用「年份(2025 / 2026)」與「a16z 團隊分類」交叉篩選,並即時搜尋標題 / 作者 / 關鍵字
- 📚 **分類導覽** — 10 個 a16z 投資團隊分類各自的主題說明與預測數
- 🌏 **中英文全頁切換** — 一鍵把整頁(表格、圖表、詳情、介面)切換成中文或英文,圖表會跟著重繪、無殘留
- 🌗 **深色 / 淺色** 主題切換,並記憶你的偏好(localStorage);切換時圖表自動以對應配色重繪
- ⌨️ **鍵盤導航 + 深層連結** — 詳情視窗左右方向鍵切換、Esc 關閉;每個預測都有 `#slug` 可分享網址
- 📱 **響應式** — 手機到桌機皆順暢;Material Design 3 暖橙色視覺

## 📂 內容結構 / 資料來源

| 年份 | 數量 | 來源 |
|---|---|---|
| 2025 | 49 | [Big Ideas in Tech 2025](https://a16z.com/big-ideas-in-tech-2025/) |
| 2026 | 47 | [Part 1](https://a16z.com/newsletter/big-ideas-2026-part-1/) · [Part 2](https://a16z.com/newsletter/big-ideas-2026-part-2/) · [Part 3](https://a16z.com/newsletter/big-ideas-2026-part-3/) |

- 分類:美國動能、應用程式、生技與健康、消費科技、加密貨幣、企業與金融科技、遊戲、成長期科技、基礎設施、Speedrun。
- 資料管線:各來源文章 → `data/chunk-*.json`(逐篇翻譯結構化)→ `data/_assemble.py` 合併 → `data/data.js`。
- **聲明**:本站非 a16z 官方產品,內容為個人整理與翻譯,如有出入以原文為準。

## 🛠 本機使用

```bash
git clone https://github.com/tingwei161803/a16z-big-ideas.git
cd a16z-big-ideas

# 直接打開 index.html,或起一個本機伺服器(資料以 <script> 載入,建議用伺服器)
uv run python -m http.server 4173
# 開 http://localhost:4173
```

重新產生資料(若更新了 `data/chunk-*.json`):

```bash
uv run python data/_assemble.py
```

## 🧱 技術

純 HTML / CSS / JavaScript,**零 build**(無 npm / 打包工具),Material Design 3。圖表用 [Chart.js](https://www.chartjs.org/)(CDN),熱力圖為純 CSS grid,皆隨主題 / 語言重繪。可直接部署到 GitHub Pages。

頁面分四個區塊:`#viz` 統計總覽 · `#reality` 現況查核 · `#explorer` 預測總表 · `#categories` 分類導覽,全部在單一 `index.html` 內以 `data/data.js`(`window.SITE_*`)驅動。

## 📝 License

內容著作權屬 a16z 原作者;本整理專案之程式碼以 MIT 釋出。
