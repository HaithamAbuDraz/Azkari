"use strict";
// =============================================
// STATE
// =============================================
const state = { counters: {}, activeTab: 'morning' };

// =============================================
// LOAD AZKAR DATA
// =============================================
let AZKAR_DATA = {};
async function loadAzkarData() {
  try {
    const response = await fetch("../../assets/Data/azkar-data.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    AZKAR_DATA = await response.json();
    state.dataLoaded = true;
  } catch (error) {
    console.error('Error loading azkar data:', error);
    // Show error message to user
    showToast('حدث خطأ في تحميل البيانات. يرجى تحديث الصفحة.');
  }

  renderAll();
  updateClock();
  autoSuggestTab();
}

// =============================================
// MOBILE NAV
// =============================================
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileNav').classList.add('open');
  document.getElementById('hamburger').setAttribute('aria-expanded', 'true');
});
document.getElementById('closeNav').addEventListener('click', closeMobileNav);
function closeMobileNav() {
  document.getElementById('mobileNav').classList.remove('open');
  document.getElementById('hamburger').setAttribute('aria-expanded', 'false');
}

// =============================================
// CLOCK
// =============================================
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  document.getElementById("currentTime").textContent = h + ":" + m + ":" + s;

  const hour = now.getHours();
  let period;
  if (hour >= 5 && hour < 12) period = "الصباح";
  else if (hour >= 12 && hour < 16) period = "الظهر";
  else if (hour >= 16 && hour < 19) period = "العصر";
  else if (hour >= 19 && hour < 20) period = "المغرب";
  else period = "الليل";
  document.getElementById("currentPeriod").textContent = period;

  const dateStr = now.toLocaleDateString(
    "ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    numberingSystem: "latn"
  });
  document.getElementById("currentDate").textContent = dateStr;
}

// =============================================
// THEME TOGGLE
// =============================================
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('azkar-theme', theme);
}

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// Load saved theme or system preference
(function loadTheme() {
  const saved = localStorage.getItem('azkar-theme');
  if (saved) { applyTheme(saved); return; }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
})();

// =============================================
// RENDER
// =============================================
function renderAll() {
  if (!state.dataLoaded) return;

  Object.keys(AZKAR_DATA).forEach(tab => {
    const grid = document.getElementById('grid-' + tab);
    if (!grid) return;
    grid.innerHTML = '';
    AZKAR_DATA[tab].forEach((zikr, idx) => {
      const cardId = tab + '-' + idx;
      state.counters[cardId] = state.counters[cardId] ?? zikr.count;
      grid.appendChild(buildCard(zikr, idx, tab, cardId));
    });
    updateProgress(tab);
  });
}

// =============================================
// PROGRESS
// =============================================
function updateProgress(tab) {
  if (!AZKAR_DATA[tab]) return;
  const data = AZKAR_DATA[tab];
  const total = data.length;
  const done = data.filter((_, i) => state.counters[tab + '-' + i] === 0).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const fill = document.getElementById('fill-' + tab);
  const bar = document.getElementById('bar-' + tab);
  const text = document.getElementById('progress-' + tab);
  if (fill) fill.style.width = pct + '%';
  if (bar) bar.setAttribute('aria-valuenow', pct);
  if (text) text.textContent = done + ' / ' + total;
  if (done === total && total > 0) showToast('ما شاء الله! اكتملت جميع الأذكار 🎉');
}

// =============================================
// BUILD CARD
// =============================================
function buildCard(zikr, idx, tab, cardId) {
  const card = document.createElement('article');
  card.className = 'azkar-card';
  card.id = 'card-' + cardId;
  card.setAttribute('aria-label', 'ذكر رقم ' + (idx + 1));
  const remaining = state.counters[cardId];
  const done = remaining === 0;
  if (done) card.classList.add('completed');
  card.innerHTML = `
    <div class="card-number">${idx + 1}</div>
    <p class="arabic-text" lang="ar" dir="rtl">${zikr.arabic}</p>
    <div class="translation">
      <div class="translation-label">الشرح والفضل</div>
      ${zikr.translation}
    </div>
    <div class="card-meta">
      <span class="source-badge">📖 ${zikr.source}</span>
      <div class="counter-wrap" role="group" aria-label="عداد الذكر">
        <button class="counter-btn" onclick="decrementCounter('${cardId}',${zikr.count})" aria-label="عدّ" ${done ? 'disabled style="opacity:0.4"' : ''}>−</button>
        <div class="counter-display" id="cnt-${cardId}" aria-live="polite">${remaining} / ${zikr.count}</div>
        <button class="counter-btn" onclick="resetCounter('${cardId}',${zikr.count})" aria-label="إعادة">↺</button>
      </div>
    </div>`;
  return card;
}

// =============================================
// TABS
// =============================================
function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.azkar-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel-' + tab);
  if (panel) panel.classList.add('active');
  document.querySelectorAll('.tab-btn').forEach(b => {
    const a = b.dataset.tab === tab;
    b.classList.toggle('active', a);
    b.setAttribute('aria-selected', a);
  });
  document.querySelectorAll('nav a[data-tab], .mobile-nav a[data-tab]').forEach(a => {
    a.classList.toggle('active', a.dataset.tab === tab);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================
// showToast
// =============================================
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2500);
}

// =============================================
// SCROLL TOP
// =============================================
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => scrollTopBtn.classList.toggle('visible', scrollY > 400), { passive: true });


// =============================================
// AUTO SUGGEST TAB
// =============================================
function autoSuggestTab() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) switchTab('morning');
  else if (h >= 17 && h < 21) switchTab('evening');
  else if (h >= 21 || h < 5) switchTab('sleep');
}

// =============================================
// INIT
// =============================================
(function init() {
  loadAzkarData();
  updateClock();
  setInterval(updateClock, 1000);
  autoSuggestTab();
})();
