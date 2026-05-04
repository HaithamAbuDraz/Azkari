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
