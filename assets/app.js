/* =========================================================================
   a16z Big Ideas Explorer · app.js  (vanilla, no build)
   Two-axis filtering: year × category. Full-page zh/en switch.
   Reads:
     window.SITE_META       -> { title:{en,zh}, subtitle:{en,zh} }
     window.SITE_YEARS      -> ["2026","2025"]
     window.SITE_CATEGORIES -> [{ key, en, zh }]
     window.SITE_DATA       -> [{ slug, year, category, title:{en,zh}, author,
                                  summary:{en,zh}, tags:[], source,
                                  update?:{en,zh}, links?:[{title,url}] }]
   ========================================================================= */
(function () {
  "use strict";

  var DATA = Array.isArray(window.SITE_DATA) ? window.SITE_DATA : [];
  var CATS = Array.isArray(window.SITE_CATEGORIES) ? window.SITE_CATEGORIES : [];
  var YEARS = Array.isArray(window.SITE_YEARS) ? window.SITE_YEARS : [];
  var META = window.SITE_META || {};

  /* ---------- i18n strings (UI chrome only) ---------- */
  var I18N = {
    en: {
      brand: "a16z Big Ideas Explorer",
      brandSub: "96 tech predictions · 2025 & 2026",
      search: "Search ideas, authors, keywords…",
      empty: "No matching ideas.",
      all: "All",
      footer: 'Curated & translated from <a href="https://a16z.com/big-ideas-in-tech-2025/" target="_blank" rel="noopener">a16z Big Ideas in Tech 2025</a> and <a href="https://a16z.com/newsletter/big-ideas-2026-part-1/" target="_blank" rel="noopener">Big Ideas 2026</a>. Unofficial project.',
      by: "By",
      source: "Read the original",
      update: "Reality check (2025–26)",
      count: function (n) { return n + " idea" + (n === 1 ? "" : "s"); }
    },
    zh: {
      brand: "a16z 科技大點子圖鑑",
      brandSub: "96 個科技預測 · 2025 & 2026",
      search: "搜尋大點子、作者、關鍵字…",
      empty: "沒有符合的結果。",
      all: "全部",
      footer: '內容整理、翻譯自 <a href="https://a16z.com/big-ideas-in-tech-2025/" target="_blank" rel="noopener">a16z Big Ideas in Tech 2025</a> 與 <a href="https://a16z.com/newsletter/big-ideas-2026-part-1/" target="_blank" rel="noopener">Big Ideas 2026</a>。本站為非官方整理。',
      by: "作者",
      source: "閱讀原文",
      update: "現況查核(2025–26)",
      count: function (n) { return "共 " + n + " 個大點子"; }
    }
  };

  /* ---------- state ---------- */
  var state = {
    lang:   localStorage.getItem("lang")  || "zh",
    theme:  localStorage.getItem("theme") || "light",
    search: "",
    year:   "all",
    category: "all"
  };

  var $ = function (id) { return document.getElementById(id); };
  var grid = $("grid"), empty = $("empty"), chips = $("chips"),
      yearSeg = $("yearSeg"), searchEl = $("searchInput"),
      dialog = $("dialog"), dialogBody = $("dialogBody"),
      resultCount = $("resultCount");

  var visible = [];

  /* ---------- helpers ---------- */
  function t(obj) {
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    return obj[state.lang] || obj.en || obj.zh || "";
  }
  function ui(key) { return (I18N[state.lang] || I18N.en)[key]; }
  function catLabel(key) {
    var c = CATS.find(function (x) { return x.key === key; });
    return c ? (c[state.lang] || c.en || c.zh || key) : key;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  function matches(item) {
    if (state.year !== "all" && item.year !== state.year) return false;
    if (state.category !== "all" && item.category !== state.category) return false;
    if (!state.search) return true;
    var q = state.search.toLowerCase();
    var hay = [
      t(item.title), t(item.summary), item.author || "",
      (item.tags || []).join(" "), catLabel(item.category), item.year
    ].join(" ").toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  /* ---------- render cards ---------- */
  function render() {
    visible = DATA.filter(matches);
    grid.innerHTML = "";

    visible.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "card";
      card.tabIndex = 0;
      card.dataset.slug = item.slug;

      var badges =
        '<span class="card__cat cat--' + escapeHtml(item.category) + '">' +
          escapeHtml(catLabel(item.category)) + "</span>" +
        '<span class="card__year">' + escapeHtml(item.year) + "</span>" +
        (item.update ? '<span class="card__flag" title="' + escapeHtml(ui("update")) +
          '"><span class="material-symbols-rounded">fact_check</span></span>' : "");

      var tags = (item.tags || []).slice(0, 3).map(function (tg) {
        return '<span class="tag">' + escapeHtml(tg) + "</span>";
      }).join("");

      card.innerHTML =
        '<div class="card__badges">' + badges + "</div>" +
        '<h3 class="card__title">' + escapeHtml(t(item.title)) + "</h3>" +
        '<p class="card__author">' + escapeHtml(item.author || "") + "</p>" +
        '<p class="card__summary">' + escapeHtml(t(item.summary)) + "</p>" +
        '<div class="card__tags">' + tags + "</div>";

      card.addEventListener("click", function () { openDialog(item.slug); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDialog(item.slug); }
      });
      grid.appendChild(card);
    });

    empty.hidden = visible.length !== 0;
    empty.textContent = ui("empty");
    resultCount.textContent = ui("count")(visible.length);
  }

  /* ---------- year segmented control ---------- */
  function buildYears() {
    yearSeg.innerHTML = "";
    ["all"].concat(YEARS).forEach(function (y) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "seg__btn";
      b.dataset.year = y;
      var lbl = y === "all" ? ui("all") : y;
      b.textContent = lbl;
      b.setAttribute("aria-label", lbl);
      b.setAttribute("aria-pressed", String(state.year === y));
      b.addEventListener("click", function () {
        state.year = y; syncYears(); render();
      });
      yearSeg.appendChild(b);
    });
  }
  function syncYears() {
    [].forEach.call(yearSeg.children, function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.year === state.year));
    });
  }

  /* ---------- category chips ---------- */
  function buildChips() {
    chips.innerHTML = "";
    ["all"].concat(CATS.map(function (c) { return c.key; })).forEach(function (key) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.dataset.cat = key;
      var lbl = key === "all" ? ui("all") : catLabel(key);
      b.textContent = lbl;
      b.setAttribute("aria-label", lbl);
      b.setAttribute("aria-pressed", String(state.category === key));
      b.addEventListener("click", function () {
        state.category = key; syncChips(); render();
      });
      chips.appendChild(b);
    });
  }
  function syncChips() {
    [].forEach.call(chips.children, function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.cat === state.category));
    });
  }

  /* ---------- dialog + keyboard nav + deep links ---------- */
  function openDialog(slug) {
    var item = DATA.find(function (d) { return d.slug === slug; });
    if (!item) return;

    var links = (item.links || []).map(function (l) {
      return '<li><a href="' + escapeHtml(l.url) + '" target="_blank" rel="noopener">' +
             escapeHtml(l.title || l.url) + "</a></li>";
    }).join("");

    var updateBlock = item.update ? (
      '<div class="reality">' +
        '<h4><span class="material-symbols-rounded">fact_check</span> ' + escapeHtml(ui("update")) + "</h4>" +
        "<p>" + escapeHtml(t(item.update)) + "</p>" +
        (links ? '<ul class="reality__links">' + links + "</ul>" : "") +
      "</div>"
    ) : "";

    dialogBody.innerHTML =
      '<div class="dialog__badges">' +
        '<span class="card__cat cat--' + escapeHtml(item.category) + '">' + escapeHtml(catLabel(item.category)) + "</span>" +
        '<span class="card__year">' + escapeHtml(item.year) + (item.part ? " · " + escapeHtml(item.part) : "") + "</span>" +
      "</div>" +
      "<h2>" + escapeHtml(t(item.title)) + "</h2>" +
      '<p class="dialog__author">' + escapeHtml(ui("by")) + " " + escapeHtml(item.author || "") + "</p>" +
      "<p>" + escapeHtml(t(item.summary)) + "</p>" +
      updateBlock +
      (item.source ? '<p class="dialog__source"><a href="' + escapeHtml(item.source) +
        '" target="_blank" rel="noopener"><span class="material-symbols-rounded">open_in_new</span> ' +
        escapeHtml(ui("source")) + "</a></p>" : "");

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
    if (idx === -1) return;
    var next = visible[(idx + delta + visible.length) % visible.length];
    if (next) openDialog(next.slug);
  }

  /* ---------- theme + lang ---------- */
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    var icon = $("themeIcon");
    if (icon) icon.textContent = state.theme === "dark" ? "light_mode" : "dark_mode";
    localStorage.setItem("theme", state.theme);
  }
  function applyLang() {
    document.documentElement.setAttribute("lang", state.lang === "zh" ? "zh-Hant" : "en");
    localStorage.setItem("lang", state.lang);
    var label = $("langLabel");
    if (label) label.textContent = state.lang === "en" ? "中" : "EN";
    // keep <title> bilingual
    if (META.title) document.title = t(META.title) + " · Big Ideas Explorer";
    // translate chrome
    [].forEach.call(document.querySelectorAll("[data-i18n],[data-i18n-html]"), function (el) {
      var html = el.hasAttribute("data-i18n-html");
      var key = el.getAttribute(html ? "data-i18n-html" : "data-i18n");
      var dict = I18N[state.lang] || I18N.en;
      if (dict[key] == null) return;
      var attr = el.getAttribute("data-i18n-attr");
      if (attr) el.setAttribute(attr, dict[key]);
      else if (html) el.innerHTML = dict[key];
      else el.textContent = dict[key];
    });
  }

  /* ---------- GitHub stars ---------- */
  function loadStars() {
    var el = $("ghStar"); if (!el) return;
    var repo = el.dataset.repo; if (!repo) return;
    fetch("https://api.github.com/repos/" + repo)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j && typeof j.stargazers_count === "number") {
          var n = j.stargazers_count;
          $("ghStarCount").textContent = n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
        }
      })
      .catch(function () {});
  }

  /* ---------- wiring ---------- */
  function wire() {
    searchEl.addEventListener("input", function (e) { state.search = e.target.value.trim(); render(); });
    $("themeToggle").addEventListener("click", function () {
      state.theme = state.theme === "dark" ? "light" : "dark"; applyTheme();
    });
    $("langToggle").addEventListener("click", function () {
      state.lang = state.lang === "en" ? "zh" : "en";
      applyLang(); buildYears(); buildChips(); render();
      var open = location.hash.slice(1);
      if (dialog.open && open) openDialog(open);   // 全頁切換:重繪開啟中的對話框
    });
    $("dialogClose").addEventListener("click", closeDialog);
    $("navPrev").addEventListener("click", function () { navBy(-1); });
    $("navNext").addEventListener("click", function () { navBy(1); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) closeDialog(); });
    dialog.addEventListener("close", function () {
      if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    });
    document.addEventListener("keydown", function (e) {
      if (!dialog.open) return;
      if (e.key === "ArrowRight") navBy(1);
      else if (e.key === "ArrowLeft") navBy(-1);
    });
    window.addEventListener("hashchange", syncFromHash);
  }
  function syncFromHash() {
    var slug = location.hash.slice(1);
    if (slug && DATA.some(function (d) { return d.slug === slug; })) openDialog(slug);
    else if (!slug && dialog.open) dialog.close();
  }

  function init() {
    applyTheme(); applyLang(); buildYears(); buildChips(); render(); wire();
    loadStars(); syncFromHash();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
