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
    console.log(response);
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
// showToast
// =============================================
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2500);
}

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
})();
