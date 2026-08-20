/* =========================================================================
   a16z Big Ideas Explorer · app.js  (vanilla, zero-build)
   Multi-section layout modelled on the AppWorks atlas:
     hero + animated stats · charts (Chart.js) · category×year heatmap ·
     reality-check spotlight · sortable/filterable predictions TABLE · glossary
   Reads (from data/data.js):
     window.SITE_META, SITE_YEARS, SITE_CATEGORIES,
     window.SITE_DATA -> [{ slug, year, category, title:{en,zh}, author,
                            summary:{en,zh}, tags:[], source, part,
                            update?:{en,zh}, links?:[{title,url}] }]
   ========================================================================= */
(function () {
  "use strict";

  var DATA  = Array.isArray(window.SITE_DATA) ? window.SITE_DATA : [];
  var CATS  = Array.isArray(window.SITE_CATEGORIES) ? window.SITE_CATEGORIES : [];
  var YEARS = Array.isArray(window.SITE_YEARS) ? window.SITE_YEARS.slice() : [];
  var META  = window.SITE_META || {};

  /* years ascending for charts/heatmap, e.g. ["2025","2026"] */
  var YEARS_ASC = YEARS.slice().sort();

  /* ---------- i18n (UI chrome + section headings) ---------- */
  var I18N = {
    en: {
      brand: "a16z Big Ideas Explorer",
      brandSub: "2025 + 2026 · 96 tech predictions",
      eyebrow: "Curated & translated from a16z's official Big Ideas series",
      heroTitle: 'The <span class="grad">96 big ideas</span> a16z is betting on for 2025–26',
      heroDesc: "An interactive, bilingual explorer of every Andreessen Horowitz tech prediction for 2025 and 2026 — with stats, a reality check, and a sortable, filterable table.",
      statIdeas: "Big ideas", statYears: "Years", statCats: "Teams", statAuthors: "Authors", statChecked: "Reality-checked",
      navViz: "Overview", navReality: "Reality check", navExplorer: "All predictions", navCategories: "Categories",
      vizTitle: "Stats overview", vizSub: "Slice the 96 predictions by category and year to see where a16z is concentrating its bets.",
      vizByCat: "Predictions per category", vizByYear: "Split by year", vizHeatmap: "Category × year heatmap",
      realityTitle: "Reality check · prediction vs. reality", realitySub: "Six flagship predictions, fact-checked against what actually happened through 2025–26, with sources.",
      realityWhat: "What actually happened", sources: "Sources",
      explorerTitle: "All 96 predictions", explorerSub: "Click a column header to sort, filter by year and category, search live. Click any row for the bilingual detail.",
      categoriesTitle: "Categories", categoriesSub: "a16z groups its big ideas by internal investing team — each focused on a different frontier.",
      search: "Search ideas, authors, keywords…",
      all: "All", empty: "No matching predictions.",
      colYear: "Year", colCat: "Category", colTitle: "Big idea", colAuthor: "Author", colCheck: "Check",
      by: "By", source: "Read the original", update: "Reality check (2025–26)",
      footer: 'Curated & translated from <a href="https://a16z.com/big-ideas-in-tech-2025/" target="_blank" rel="noopener">a16z Big Ideas in Tech 2025</a> and <a href="https://a16z.com/newsletter/big-ideas-2026-part-1/" target="_blank" rel="noopener">Big Ideas 2026</a>. Unofficial project for study only.',
      themeDark: "Switch to dark", themeLight: "Switch to light",
      count: function (n) { return n + " prediction" + (n === 1 ? "" : "s"); }
    },
    zh: {
      brand: "a16z 科技大點子圖鑑",
      brandSub: "2025 + 2026 · 96 個科技預測",
      eyebrow: "整理、翻譯自 a16z 官方 Big Ideas 系列",
      heroTitle: 'a16z 押注 2025–26 的 <span class="grad">96 個大點子</span>',
      heroDesc: "把 Andreessen Horowitz 各團隊對 2025 與 2026 的科技預測,整理成一份可看統計、可查現況、可排序篩選、可雙語切換的互動圖鑑。",
      statIdeas: "大點子", statYears: "年份", statCats: "團隊分類", statAuthors: "作者", statChecked: "現況查核",
      navViz: "統計總覽", navReality: "現況查核", navExplorer: "預測總表", navCategories: "分類導覽",
      vizTitle: "統計總覽", vizSub: "把 96 個預測依分類與年份切開,一眼看出 a16z 的重心落在哪。",
      vizByCat: "各分類預測數", vizByYear: "年份分布", vizHeatmap: "分類 × 年份 熱力圖",
      realityTitle: "現況查核 · 預測 vs 現實", realitySub: "挑出 6 個旗艦預測,查證「到 2025–26 年實際發生了什麼」,並附上來源連結。",
      realityWhat: "實際發生了什麼", sources: "來源",
      explorerTitle: "96 個預測總表", explorerSub: "點欄位標題排序、用年份與分類交叉篩選、即時搜尋。點任一列看雙語詳情。",
      categoriesTitle: "分類導覽", categoriesSub: "a16z 把大點子依內部投資團隊分成這幾類,每類專注的主題不同。",
      search: "搜尋大點子、作者、關鍵字…",
      all: "全部", empty: "沒有符合的結果。",
      colYear: "年份", colCat: "分類", colTitle: "大點子", colAuthor: "作者", colCheck: "查核",
      by: "作者", source: "閱讀原文", update: "現況查核(2025–26)",
      footer: '內容整理、翻譯自 <a href="https://a16z.com/big-ideas-in-tech-2025/" target="_blank" rel="noopener">a16z Big Ideas in Tech 2025</a> 與 <a href="https://a16z.com/newsletter/big-ideas-2026-part-1/" target="_blank" rel="noopener">Big Ideas 2026</a>。本站為非官方整理,內容僅供研究參考。',
      themeDark: "切換深色", themeLight: "切換淺色",
      count: function (n) { return "共 " + n + " 個預測"; }
    }
  };

  /* ---------- category descriptions (for the glossary) ---------- */
  var CAT_DESC = {
    "american-dynamism": { en: "Companies advancing the national interest — defense, aerospace, energy, manufacturing, and critical infrastructure.", zh: "推進國家利益的公司——國防、航太、能源、製造與關鍵基礎設施。" },
    "apps": { en: "AI-native consumer and prosumer applications that reach people directly.", zh: "直接觸及使用者的 AI 原生消費型與生產力應用程式。" },
    "bio-health": { en: "Biology, healthcare and drug discovery reshaped by AI and engineering.", zh: "被 AI 與工程重新形塑的生物學、醫療照護與藥物開發。" },
    "consumer": { en: "Consumer tech, social, and the creator economy.", zh: "消費科技、社群,以及創作者經濟。" },
    "crypto": { en: "Blockchains, stablecoins, and decentralised infrastructure going mainstream.", zh: "走向主流的區塊鏈、穩定幣與去中心化基礎設施。" },
    "enterprise-fintech": { en: "Enterprise software and the financial infrastructure that runs business.", zh: "驅動企業營運的企業軟體與金融基礎設施。" },
    "games": { en: "Games, interactive entertainment, and the technology behind virtual worlds.", zh: "遊戲、互動娛樂,以及支撐虛擬世界的技術。" },
    "growth": { en: "Growth-stage companies scaling category-defining products.", zh: "規模化、定義品類的成長期公司。" },
    "infrastructure": { en: "The compute, data, and AI infrastructure layer everything else is built on.", zh: "其他一切建構其上的運算、資料與 AI 基礎設施層。" },
    "speedrun": { en: "a16z SPEEDRUN — the accelerator backing games and consumer founders at the earliest stage.", zh: "a16z SPEEDRUN——在最早期支持遊戲與消費領域創辦人的加速器。" }
  };

  /* ---------- state ---------- */
  var state = {
    lang:     localStorage.getItem("a16z.lang")  || "en",
    theme:    localStorage.getItem("a16z.theme") ||
              (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
    search:   "",
    year:     "all",
    category: "all",
    sortKey:  "year",
    sortDir:  "desc"
  };

  var $  = function (id) { return document.getElementById(id); };
  var $$ = function (sel, r) { return Array.prototype.slice.call((r || document).querySelectorAll(sel)); };

  var visible = [];           // currently filtered + sorted rows
  var charts  = {};           // Chart.js instances

  /* ---------- helpers ---------- */
  function t(obj) {
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    return obj[state.lang] || obj.en || obj.zh || "";
  }
  function ui(key) { return (I18N[state.lang] || I18N.en)[key]; }
  function catObj(key) { return CATS.find(function (x) { return x.key === key; }) || null; }
  function catLabel(key) { var c = catObj(key); return c ? (c[state.lang] || c.en || key) : key; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
  }
  function authorCount() {
    var set = {};
    DATA.forEach(function (d) { if (d.author) set[d.author] = 1; });
    return Object.keys(set).length;
  }

  /* ---------- filter + sort ---------- */
  function matches(item) {
    if (state.year !== "all" && item.year !== state.year) return false;
    if (state.category !== "all" && item.category !== state.category) return false;
    if (!state.search) return true;
    var q = state.search.toLowerCase();
    var hay = [
      t(item.title), t(item.summary), item.author || "",
      (item.tags || []).join(" "), catLabel(item.category), item.year
    ].join(" ").toLowerCase();
    return q.split(/\s+/).filter(Boolean).every(function (term) { return hay.indexOf(term) !== -1; });
  }
  function sortVal(item, key) {
    if (key === "year")     return item.year || "";
    if (key === "category") return catLabel(item.category);
    if (key === "title")    return t(item.title);
    if (key === "author")   return item.author || "";
    if (key === "checked")  return item.update ? 1 : 0;
    return "";
  }
  function compute() {
    visible = DATA.filter(matches);
    var k = state.sortKey, dir = state.sortDir === "asc" ? 1 : -1;
    var coll = new Intl.Collator(state.lang === "zh" ? "zh-Hant" : "en", { numeric: true, sensitivity: "base" });
    visible.sort(function (a, b) {
      var va = sortVal(a, k), vb = sortVal(b, k), c;
      if (typeof va === "number") c = va - vb;
      else c = coll.compare(va, vb);
      if (c === 0 && k !== "title") c = coll.compare(t(a.title), t(b.title)); // stable tiebreak
      return c * dir;
    });
  }

  /* ============================ TABLE ============================ */
  function renderTable() {
    compute();
    var wrap = $("tableWrap");
    var arrow = function (key) {
      if (state.sortKey !== key) return '<span class="th-arrow material-symbols-rounded">unfold_more</span>';
      return '<span class="th-arrow th-arrow--on material-symbols-rounded">' +
             (state.sortDir === "asc" ? "arrow_upward" : "arrow_downward") + "</span>";
    };
    /* sort key -> i18n key. Two of them don't match the sort key, so look the
       label up explicitly rather than deriving it from the key. */
    var COL_LABEL = { year: "colYear", category: "colCat", title: "colTitle", author: "colAuthor", checked: "colCheck" };
    var th = function (key, cls) {
      return '<th class="' + (cls || "") + '" data-sort="' + key + '" tabindex="0" ' +
             'aria-sort="' + (state.sortKey === key ? (state.sortDir === "asc" ? "ascending" : "descending") : "none") + '">' +
             '<span>' + esc(ui(COL_LABEL[key])) + "</span>" + arrow(key) + "</th>";
    };

    var rows = visible.map(function (item) {
      var snippet = t(item.summary);
      if (snippet.length > 96) snippet = snippet.slice(0, 96) + "…";
      var checkCell = item.update
        ? '<span class="check-yes material-symbols-rounded" title="' + esc(ui("update")) + '">fact_check</span>'
        : '<span class="check-no">—</span>';
      return '<tr data-slug="' + esc(item.slug) + '" tabindex="0">' +
        '<td data-label="' + esc(ui("colYear")) + '"><span class="yr-badge">' + esc(item.year) + "</span></td>" +
        '<td data-label="' + esc(ui("colCat")) + '"><span class="cat-pill cat--' + esc(item.category) + '">' + esc(catLabel(item.category)) + "</span></td>" +
        '<td data-label="' + esc(ui("colTitle")) + '" class="col-title"><span class="row-title">' + esc(t(item.title)) + "</span>" +
          '<span class="row-snip">' + esc(snippet) + "</span></td>" +
        '<td data-label="' + esc(ui("colAuthor")) + '" class="col-author">' + esc(item.author || "") + "</td>" +
        '<td data-label="' + esc(ui("colCheck")) + '" class="col-check">' + checkCell + "</td>" +
      "</tr>";
    }).join("");

    wrap.innerHTML =
      '<table class="ptable"><thead><tr>' +
        th("year") + th("category") + th("title", "col-title") + th("author", "col-author") + th("checked", "col-check") +
      "</tr></thead><tbody>" + rows + "</tbody></table>";

    $("empty").hidden = visible.length !== 0;
    $("empty").textContent = ui("empty");
    $("resultCount").textContent = ui("count")(visible.length);

    $$("th[data-sort]", wrap).forEach(function (h) {
      var key = h.getAttribute("data-sort");
      var onSort = function () {
        if (state.sortKey === key) state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        else { state.sortKey = key; state.sortDir = key === "title" || key === "category" || key === "author" ? "asc" : "desc"; }
        renderTable();
      };
      h.addEventListener("click", onSort);
      h.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSort(); } });
    });
    $$("tbody tr", wrap).forEach(function (tr) {
      var slug = tr.getAttribute("data-slug");
      tr.addEventListener("click", function () { openDialog(slug); });
      tr.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDialog(slug); } });
    });
  }

  /* ============================ CHARTS ============================ */
  function catCounts() {
    return CATS.map(function (c) {
      return { key: c.key, label: catLabel(c.key), count: DATA.filter(function (d) { return d.category === c.key; }).length };
    }).filter(function (x) { return x.count > 0; }).sort(function (a, b) { return b.count - a.count; });
  }
  function renderCharts() {
    if (typeof Chart === "undefined") return;
    Object.keys(charts).forEach(function (k) { if (charts[k]) charts[k].destroy(); });

    var onSurf  = cssVar("--on-surface");
    var onVar   = cssVar("--on-surface-variant");
    var grid    = cssVar("--outline-variant");
    var cats    = catCounts();

    /* horizontal bar: predictions per category */
    charts.cat = new Chart($("chartCat"), {
      type: "bar",
      data: { labels: cats.map(function (x) { return x.label; }), datasets: [{
        data: cats.map(function (x) { return x.count; }),
        backgroundColor: cats.map(function (x) { return cssVar("--c-" + x.key); }),
        borderRadius: 6, borderWidth: 0
      }] },
      options: {
        indexAxis: "y", responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return " " + c.parsed.x; } } } },
        scales: {
          x: { ticks: { color: onVar, font: { size: 11 }, precision: 0 }, grid: { color: grid } },
          y: { ticks: { color: onSurf, font: { size: 11 } }, grid: { display: false } }
        }
      }
    });

    /* doughnut: split by year */
    var yc = YEARS_ASC.map(function (y) { return DATA.filter(function (d) { return d.year === y; }).length; });
    charts.year = new Chart($("chartYear"), {
      type: "doughnut",
      data: { labels: YEARS_ASC, datasets: [{
        data: yc,
        backgroundColor: [cssVar("--c-2025"), cssVar("--c-2026")],
        borderWidth: 0
      }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "58%",
        plugins: { legend: { position: "bottom", labels: { color: onSurf, font: { size: 12 }, boxWidth: 12, padding: 12 } },
                   tooltip: { callbacks: { label: function (c) { return " " + c.label + ": " + c.parsed; } } } }
      }
    });
  }

  /* ============================ HEATMAP ============================ */
  function renderHeatmap() {
    var root = $("heatmap");
    if (!root) return;
    var rows = CATS, cols = YEARS_ASC;
    var counts = {}, maxC = 0;
    DATA.forEach(function (d) {
      var key = d.category + "__" + d.year;
      counts[key] = (counts[key] || 0) + 1;
      if (counts[key] > maxC) maxC = counts[key];
    });
    root.style.gridTemplateColumns = "minmax(96px, 1.4fr) repeat(" + cols.length + ", minmax(56px, 1fr)) 56px";
    var cells = ['<div class="hm-cell hm-head"></div>'];
    cols.forEach(function (y) { cells.push('<div class="hm-cell hm-head">' + esc(y) + "</div>"); });
    cells.push('<div class="hm-cell hm-head">Σ</div>');
    rows.forEach(function (c) {
      var rowTotal = DATA.filter(function (d) { return d.category === c.key; }).length;
      cells.push('<div class="hm-cell hm-rowhead"><span class="hm-dot cat--' + esc(c.key) + '"></span>' + esc(catLabel(c.key)) + "</div>");
      cols.forEach(function (y) {
        var n = counts[c.key + "__" + y] || 0;
        var op = n === 0 ? 0 : 0.16 + 0.72 * (n / maxC);
        cells.push('<div class="hm-cell" style="background:color-mix(in srgb, var(--primary) ' + (op * 100).toFixed(0) +
          '%, transparent); color:' + (op > 0.5 ? "var(--on-primary)" : "var(--on-surface)") + '" ' +
          'title="' + esc(catLabel(c.key)) + " × " + esc(y) + ": " + n + '">' + (n || "") + "</div>");
      });
      cells.push('<div class="hm-cell hm-total">' + rowTotal + "</div>");
    });
    root.innerHTML = cells.join("");
  }

  /* ============================ REALITY ============================ */
  function renderReality() {
    var wrap = $("reality-grid");
    if (!wrap) return;
    var checked = DATA.filter(function (d) { return d.update; });
    wrap.innerHTML = checked.map(function (item) {
      var links = (item.links || []).slice(0, 2).map(function (l) {
        return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener"><span class="material-symbols-rounded">link</span>' +
               esc(l.title || l.url) + "</a>";
      }).join("");
      return '<article class="reality-card" data-slug="' + esc(item.slug) + '" tabindex="0">' +
        '<div class="reality-card__top">' +
          '<span class="cat-pill cat--' + esc(item.category) + '">' + esc(catLabel(item.category)) + "</span>" +
          '<span class="yr-badge">' + esc(item.year) + "</span>" +
        "</div>" +
        "<h3>" + esc(t(item.title)) + "</h3>" +
        '<p class="reality-card__pred">' + esc(t(item.summary)) + "</p>" +
        '<div class="reality-card__what">' +
          '<span class="reality-card__label"><span class="material-symbols-rounded">trending_up</span>' + esc(ui("realityWhat")) + "</span>" +
          "<p>" + esc(t(item.update)) + "</p>" +
        "</div>" +
        (links ? '<div class="reality-card__links">' + links + "</div>" : "") +
      "</article>";
    }).join("");
    $$(".reality-card", wrap).forEach(function (card) {
      var slug = card.getAttribute("data-slug");
      card.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;       // let source links work
        openDialog(slug);
      });
      card.addEventListener("keydown", function (e) {
        if ((e.key === "Enter" || e.key === " ") && !e.target.closest("a")) { e.preventDefault(); openDialog(slug); }
      });
    });
  }

  /* ============================ GLOSSARY ============================ */
  function renderCategories() {
    var wrap = $("cat-grid");
    if (!wrap) return;
    wrap.innerHTML = CATS.map(function (c) {
      var n = DATA.filter(function (d) { return d.category === c.key; }).length;
      var desc = CAT_DESC[c.key] ? t(CAT_DESC[c.key]) : "";
      return '<button class="cat-card cat--' + esc(c.key) + '" data-cat="' + esc(c.key) + '">' +
        '<div class="cat-card__head"><span class="cat-card__dot"></span><h3>' + esc(catLabel(c.key)) + "</h3>" +
          '<span class="cat-card__n">' + n + "</span></div>" +
        "<p>" + esc(desc) + "</p>" +
      "</button>";
    }).join("");
    $$(".cat-card", wrap).forEach(function (b) {
      b.addEventListener("click", function () {
        state.category = b.getAttribute("data-cat");
        syncChips(); renderTable();
        $("explorer").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ============================ CHIPS + YEAR SEG ============================ */
  function buildYears() {
    var seg = $("yearSeg");
    seg.innerHTML = "";
    ["all"].concat(YEARS).forEach(function (y) {
      var b = document.createElement("button");
      b.type = "button"; b.dataset.year = y;
      b.textContent = y === "all" ? ui("all") : y;
      b.setAttribute("aria-pressed", String(state.year === y));
      b.addEventListener("click", function () { state.year = y; syncYears(); renderTable(); });
      seg.appendChild(b);
    });
  }
  function syncYears() {
    $$("#yearSeg button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.year === state.year)); });
  }
  function buildChips() {
    var chips = $("chips");
    chips.innerHTML = "";
    ["all"].concat(CATS.map(function (c) { return c.key; })).forEach(function (key) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "chip" + (key === "all" ? "" : " chip--" + key); b.dataset.cat = key;
      var n = key === "all" ? DATA.length : DATA.filter(function (d) { return d.category === key; }).length;
      b.innerHTML = (key === "all" ? esc(ui("all")) : esc(catLabel(key))) + ' <span class="chip__n">' + n + "</span>";
      b.setAttribute("aria-pressed", String(state.category === key));
      b.addEventListener("click", function () { state.category = key; syncChips(); renderTable(); });
      chips.appendChild(b);
    });
  }
  function syncChips() {
    $$("#chips .chip").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.cat === state.category)); });
  }

  /* ============================ DIALOG ============================ */
  var dialog = $("dialog"), dialogBody = $("dialogBody");
  function openDialog(slug) {
    var item = DATA.find(function (d) { return d.slug === slug; });
    if (!item) return;
    var links = (item.links || []).map(function (l) {
      return '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.title || l.url) + "</a></li>";
    }).join("");
    var updateBlock = item.update ? (
      '<div class="reality">' +
        "<h4><span class=\"material-symbols-rounded\">fact_check</span> " + esc(ui("update")) + "</h4>" +
        "<p>" + esc(t(item.update)) + "</p>" +
        (links ? '<ul class="reality__links">' + links + "</ul>" : "") +
      "</div>"
    ) : "";
    dialogBody.innerHTML =
      '<div class="dialog__badges">' +
        '<span class="cat-pill cat--' + esc(item.category) + '">' + esc(catLabel(item.category)) + "</span>" +
        '<span class="yr-badge">' + esc(item.year) + (item.part ? " · " + esc(item.part) : "") + "</span>" +
      "</div>" +
      '<h2 id="dlg-title">' + esc(t(item.title)) + "</h2>" +
      '<p class="dialog__author">' + esc(ui("by")) + " " + esc(item.author || "") + "</p>" +
      "<p>" + esc(t(item.summary)) + "</p>" +
      updateBlock +
      (item.source ? '<p class="dialog__source"><a href="' + esc(item.source) +
        '" target="_blank" rel="noopener"><span class="material-symbols-rounded">open_in_new</span> ' +
        esc(ui("source")) + "</a></p>" : "");
    if (!dialog.open) dialog.showModal();
    if (location.hash.slice(1) !== slug) history.replaceState(null, "", "#" + slug);
  }
  function closeDialog() {
    if (dialog.open) dialog.close();
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  }
  function navBy(delta) {
    var slug = location.hash.slice(1);
    var idx = visible.findIndex(function (d) { return d.slug === slug; });
    if (idx === -1) { if (visible[0]) openDialog(visible[0].slug); return; }
    var next = visible[(idx + delta + visible.length) % visible.length];
    if (next) openDialog(next.slug);
  }

  /* ============================ THEME + LANG ============================ */
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    var icon = $("themeIcon");
    if (icon) icon.textContent = state.theme === "dark" ? "light_mode" : "dark_mode";
    var tt = $("themeToggle");
    if (tt) tt.title = state.theme === "dark" ? ui("themeLight") : ui("themeDark");
    localStorage.setItem("a16z.theme", state.theme);
  }
  function applyLang() {
    document.documentElement.setAttribute("lang", state.lang === "zh" ? "zh-Hant" : "en");
    localStorage.setItem("a16z.lang", state.lang);
    if (META.title) document.title = t(META.title) + " · Big Ideas Explorer";
    var si = $("searchInput"); if (si) si.placeholder = ui("search");
    $$("[data-i18n],[data-i18n-html]").forEach(function (el) {
      var html = el.hasAttribute("data-i18n-html");
      var key = el.getAttribute(html ? "data-i18n-html" : "data-i18n");
      var dict = I18N[state.lang] || I18N.en;
      if (dict[key] == null) return;
      if (html) el.innerHTML = dict[key]; else el.textContent = dict[key];
    });
    var lz = $("langZh"), le = $("langEn");
    if (lz) lz.setAttribute("aria-pressed", String(state.lang === "zh"));
    if (le) le.setAttribute("aria-pressed", String(state.lang === "en"));
  }

  /* ============================ STAT COUNTERS ============================ */
  function animateStats() {
    $("statAuthors").setAttribute("data-count", String(authorCount()));
    $$(".hero__stat b").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var start = null, dur = 900;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target); // easeOutCubic
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ============================ GITHUB STARS ============================ */
  function loadStars() {
    var el = $("ghStar"); if (!el) return;
    var repo = el.dataset.repo; if (!repo) return;
    fetch("https://api.github.com/repos/" + repo)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j && typeof j.stargazers_count === "number") {
          var n = j.stargazers_count, c = $("ghStarCount");
          c.textContent = n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
          c.hidden = false;
        }
      })
      .catch(function () {});
  }

  /* ============================ WIRING ============================ */
  function rerenderDynamic() {
    renderCharts(); renderHeatmap(); renderReality(); renderCategories(); renderTable();
  }
  function wire() {
    var si = $("searchInput"), sc = $("searchClear");
    si.addEventListener("input", function (e) {
      state.search = e.target.value.trim();
      sc.hidden = !e.target.value;
      renderTable();
    });
    sc.addEventListener("click", function () { si.value = ""; state.search = ""; sc.hidden = true; renderTable(); si.focus(); });

    $("themeToggle").addEventListener("click", function () {
      state.theme = state.theme === "dark" ? "light" : "dark"; applyTheme();
    });
    function setLang(lang) {
      if (lang === state.lang) return;
      state.lang = lang;
      applyLang(); buildYears(); buildChips(); rerenderDynamic();
      var open = location.hash.slice(1);
      if (dialog.open && open) openDialog(open);
    }
    $("langZh").addEventListener("click", function () { setLang("zh"); });
    $("langEn").addEventListener("click", function () { setLang("en"); });

    $("dialogClose").addEventListener("click", closeDialog);
    $("navPrev").addEventListener("click", function () { navBy(-1); });
    $("navNext").addEventListener("click", function () { navBy(1); });
    dialog.addEventListener("click", function (e) {
      var r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog();
    });
    dialog.addEventListener("close", function () {
      if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    });
    document.addEventListener("keydown", function (e) {
      if (!dialog.open) return;
      if (e.key === "ArrowRight") navBy(1);
      else if (e.key === "ArrowLeft") navBy(-1);
    });
    window.addEventListener("hashchange", syncFromHash);

    /* re-render charts/heatmap on theme change (Chart.js reads CSS vars) */
    new MutationObserver(function () { renderCharts(); renderHeatmap(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    /* back-to-top */
    var toTop = $("toTop");
    window.addEventListener("scroll", function () { toTop.hidden = window.scrollY < 600; }, { passive: true });
    toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

    /* scroll-spy for hero nav */
    var navLinks = $$(".hero__nav a");
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["viz", "reality", "explorer", "categories"].forEach(function (id) { var s = $(id); if (s) spy.observe(s); });
  }
  function syncFromHash() {
    var slug = location.hash.slice(1);
    if (slug && DATA.some(function (d) { return d.slug === slug; })) openDialog(slug);
    else if (!slug && dialog.open) dialog.close();
  }

  function init() {
    applyTheme(); applyLang();
    buildYears(); buildChips();
    renderCharts(); renderHeatmap(); renderReality(); renderCategories(); renderTable();
    animateStats(); loadStars(); wire(); syncFromHash();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
