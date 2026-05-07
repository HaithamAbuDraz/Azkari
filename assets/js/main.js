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
    const response = await fetch("assets/Data/azkar-data.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    AZKAR_DATA = await response.json();
    state.dataLoaded = true;
  } catch (error) {
    console.error('Error loading azkar data:', error);
    // Show error message to user
    showToast('حدث خطأ في تحميل البيانات. يرجى تحديث الصفحة <i class="fas fa-exclamation-triangle"></i>');
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
  const timeString = h + ":" + m + ":" + s;

  document.querySelectorAll("#currentTime").forEach(el => {
    el.textContent = timeString;
  });

  const hour = now.getHours();
  let period;
  if (hour >= 5 && hour < 12) period = "الصباح";
  else if (hour >= 12 && hour < 16) period = "الظهر";
  else if (hour >= 16 && hour < 19) period = "العصر";
  else if (hour >= 19 && hour < 20) period = "المغرب";
  else period = "الليل";

  document.querySelectorAll("#currentPeriod").forEach(el => {
    el.textContent = period;
  });

  const dateStr = now.toLocaleDateString(
    "ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    numberingSystem: "latn"
  });

  document.querySelectorAll("#currentDate").forEach(el => {
    el.textContent = dateStr;
  });
}

// =============================================
// THEME TOGGLE
// =============================================
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  themeIcon.innerHTML = theme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
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
// COUNTERS
// =============================================
function decrementCounter(cardId, max) {
  if (state.counters[cardId] <= 0) return;
  state.counters[cardId]--;
  const remaining = state.counters[cardId];
  const display = document.getElementById('cnt-' + cardId);
  const card = document.getElementById('card-' + cardId);
  if (display) display.textContent = remaining + ' / ' + max;
  if (remaining === 0) {
    card.classList.add('completed');
    const btn = card.querySelector('.counter-btn');
    if (btn) { btn.disabled = true; btn.style.opacity = '0.4'; }
    showToast('أحسنت! اكتمل الذكر <i class="fas fa-star"></i>');
  }
  updateProgress(cardId.split('-')[0]);
  if (navigator.vibrate) navigator.vibrate(25);
}

function resetCounter(cardId, max) {
  state.counters[cardId] = max;
  const display = document.getElementById('cnt-' + cardId);
  const card = document.getElementById('card-' + cardId);
  if (display) display.textContent = max + ' / ' + max;
  if (card) {
    card.classList.remove('completed');
    const btn = card.querySelector('.counter-btn');
    if (btn) { btn.disabled = false; btn.style.opacity = ''; }
  }
  updateProgress(cardId.split('-')[0]);
}

function resetPanel(tab) {
  if (!AZKAR_DATA[tab]) return;
  AZKAR_DATA[tab].forEach((zikr, idx) => resetCounter(tab + '-' + idx, zikr.count));
  showToast('تمت إعادة التعيين <i class="fas fa-check-circle"></i>');
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
  if (done === total && total > 0) {
    showToast('ما شاء الله! اكتملت جميع الأذكار <i class="fas fa-trophy"></i>');
  }
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
      <div class="translation-label"><i class="fas fa-info-circle"></i> الشرح والفضل</div>
      ${zikr.translation}
    </div>
    <div class="card-meta">
      <span class="source-badge"><i class="fas fa-book"></i> ${zikr.source}</span>
      <div class="counter-wrap" role="group" aria-label="عداد الذكر">
        <button class="counter-btn" onclick="decrementCounter('${cardId}',${zikr.count})" aria-label="عدّ" ${done ? 'disabled style="opacity:0.4"' : ''}>−</button>
        <div class="counter-display" id="cnt-${cardId}" aria-live="polite">${remaining} / ${zikr.count}</div>
        <button class="counter-btn" onclick="resetCounter('${cardId}',${zikr.count})" aria-label="إعادة"><i class="fas fa-undo-alt"></i></button>
      </div>
    </div>`;
  return card;
}

// =============================================
// TASBIH SECTION
// =============================================
const DHIKR_LIST = [
  { label: 'سبحان الله', arabic: 'سُبْحَانَ اللَّهِ', target: 33 },
  { label: 'الحمد لله', arabic: 'الْحَمْدُ لِلَّهِ', target: 33 },
  { label: 'الله أكبر', arabic: 'اللَّهُ أَكْبَرُ', target: 34 },
  { label: 'لا إله إلا الله', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', target: 100 },
  { label: 'أستغفر الله', arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', target: 100 },
  { label: 'الصلاة على النبي', arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى مُحَمَّدٍ', target: 10 },
  { label: 'سبحان الله وبحمده', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', target: 100 },
  { label: 'حسبي الله', arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ', target: 7 },
  { label: 'مخصص', arabic: '', target: 33 },
];

const MILESTONES = [33, 66, 99, 100, 200, 300, 500, 1000];
const CIRCUMFERENCE = 2 * Math.PI * 115;

let count = 0, laps = 0, activeIdx = 0, target = 33, lastSaved = -1;
let history = JSON.parse(localStorage.getItem('tasbih-history') || '[]');

// Pills
function buildPills() {
  const c = document.getElementById('dhikrPills');
  if (!c) return;
  c.innerHTML = '';
  DHIKR_LIST.forEach((d, i) => {
    const b = document.createElement('button');
    b.className = 'dhikr-pill' + (i === activeIdx ? ' active' : '');
    b.textContent = d.label;
    b.onclick = () => selectDhikr(i);
    c.appendChild(b);
  });
}

function selectDhikr(idx) {
  activeIdx = idx;
  const d = DHIKR_LIST[idx];
  target = d.target;
  count = 0;
  laps = 0;
  updateDisplay();
  buildPills();
  const el = document.getElementById('dhikrDisplay');
  if (el) {
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = d.arabic || '— اكتب ذكرك المخصص —';
      el.style.opacity = '1';
    }, 150);
  }
  const targetEl = document.getElementById('dhikrTarget');
  if (targetEl) {
    targetEl.innerHTML = d.target ? `الهدف: <span class="target-badge">${d.target}</span>` : '';
  }
  const customTarget = document.getElementById('customTarget');
  if (customTarget) customTarget.value = d.target || '';
}

function increment(e) {
  const btn = document.getElementById('tapBtn');
  if (e && btn) {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX || r.left + r.width / 2) - r.left;
    const y = (e.clientY || r.top + r.height / 2) - r.top;
    const size = Math.max(r.width, r.height);
    const rip = document.createElement('span');
    rip.className = 'ripple';
    rip.style.cssText = `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px`;
    btn.appendChild(rip);
    setTimeout(() => rip.remove(), 600);
  }
  count++;
  if (count > target) {
    count = 1;
    laps++;
    showToast(`دورة ${laps} مكتملة! <i class="fas fa-star"></i>`);
  }
  const total = laps * target + count;
  if (MILESTONES.includes(total)) showToast(milestoneMsg(total));
  const num = document.getElementById('countDisplay');
  if (num) {
    num.classList.remove('bump');
    void num.offsetWidth;
    num.classList.add('bump');
    setTimeout(() => num.classList.remove('bump'), 120);
  }
  if (navigator.vibrate) navigator.vibrate(18);
  updateDisplay();
}

function milestoneMsg(n) {
  const msgs = {
    33: 'ثلاثة وثلاثون — سبحان الله! <i class="fas fa-star"></i>',
    66: 'ستة وستون <i class="fas fa-star"></i>',
    99: 'تسعة وتسعون — الحمد لله! <i class="fas fa-star"></i>',
    100: 'مئة تسبيحة! ما شاء الله <i class="fas fa-trophy"></i>',
    200: 'مئتان! <i class="fas fa-trophy"></i>',
    300: 'ثلاثمئة! <i class="fas fa-trophy"></i>',
    500: 'خمسمئة! بارك الله فيك <i class="fas fa-star"></i>',
    1000: 'ألف تسبيحة! ما شاء الله <i class="fas fa-trophy"></i>'
  };
  return msgs[n] || `${n} تسبيحة! <i class="fas fa-star"></i>`;
}

function undoLast() {
  if (count > 0) {
    count--;
    updateDisplay();
  } else if (laps > 0) {
    laps--;
    count = target;
    updateDisplay();
  }
}

function resetTasbihCounter() {
  count = 0;
  laps = 0;
  updateDisplay();
  showToast('تمت إعادة التعيين <i class="fas fa-check-circle"></i>');
}

function updateDisplay() {
  const countDisplay = document.getElementById('countDisplay');
  const countTotal = document.getElementById('countTotal');
  const countLaps = document.getElementById('countLaps');
  const ringProgress = document.getElementById('ringProgress');

  if (countDisplay) countDisplay.textContent = count;
  if (countTotal) countTotal.textContent = 'من ' + target;
  if (countLaps) countLaps.textContent = laps > 0 ? `الدورة ${laps}` : '';

  if (ringProgress && target > 0) {
    const pct = count / target;
    const offset = CIRCUMFERENCE * (1 - Math.min(pct, 1));
    ringProgress.style.strokeDashoffset = offset;
  }

  renderMilestones(laps * target + count);
}

function renderMilestones(total) {
  const g = document.getElementById('milestonesGrid');
  if (!g) return;
  g.innerHTML = '';
  MILESTONES.forEach(ms => {
    const c = document.createElement('div');
    c.className = 'milestone-chip' + (total >= ms ? ' reached' : '');
    c.innerHTML = `<span class="ms-number">${ms}</span><span>${total >= ms ? '✓ تم' : 'تسبيحة'}</span>`;
    g.appendChild(c);
  });
}

function saveToHistory() {
  const total = laps * target + count;
  if (total === 0 || total === lastSaved) {
    showToast('لا يوجد تسبيح للحفظ');
    return;
  }
  const d = DHIKR_LIST[activeIdx];
  const entry = {
    dhikr: d.label,
    count: total,
    time: new Date().toLocaleTimeString('ar-SA', { numberingSystem: "latn", hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString('ar-SA', { numberingSystem: "latn", day: 'numeric', month: 'short' })
  };
  history.unshift(entry);
  if (history.length > 10) history = history.slice(0, 10);
  localStorage.setItem('tasbih-history', JSON.stringify(history));
  lastSaved = total;
  renderHistory();
  showToast('تم حفظ الجلسة <i class="fas fa-save"></i>');
}

function renderHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;
  if (history.length === 0) {
    list.innerHTML = '<div class="history-empty">لا توجد جلسات محفوظة — اضغط "حفظ" بعد الانتهاء</div>';
    return;
  }
  list.innerHTML = '';
  history.forEach(e => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `<span class="hist-dhikr">${e.dhikr}</span><span class="hist-count">${e.count}×</span><span class="hist-time">${e.date} ${e.time}</span>`;
    list.appendChild(item);
  });
}
// =============================================
// TABS
// =============================================
function switchTab(tab) {
  state.activeTab = tab;

  // Switch panels
  document.querySelectorAll('.azkar-panel, .tasbih-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel-' + tab);
  if (panel) panel.classList.add('active');

  // Switch heroes
  const defaultHero = document.getElementById('defaultHeroSection');
  const tasbihHero = document.getElementById('tasbihHeroSection');

  if (defaultHero && tasbihHero) {
    if (tab === 'tasbih') {
      defaultHero.style.display = 'none';
      tasbihHero.style.display = 'block';
    } else {
      defaultHero.style.display = 'block';
      tasbihHero.style.display = 'none';
    }
  }

  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(b => {
    const a = b.dataset.tab === tab;
    b.classList.toggle('active', a);
    b.setAttribute('aria-selected', a);
  });

  // Update navigation links
  document.querySelectorAll('nav a[data-tab], .mobile-nav a[data-tab]').forEach(a => {
    a.classList.toggle('active', a.dataset.tab === tab);
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================
// showToast
// =============================================
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.innerHTML = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 1000);
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
  buildPills();
  selectDhikr(0);
  renderHistory();
  renderMilestones(0);
})();
