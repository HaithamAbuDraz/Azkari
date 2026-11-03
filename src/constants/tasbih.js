export const INITIAL_DHIKRS = [
  { label: 'سبحان الله', arabic: 'سُبْحَانَ اللَّهِ', target: 33 },
  { label: 'الحمد لله', arabic: 'الْحَمْدُ لِلَّهِ', target: 33 },
  { label: 'الله أكبر', arabic: 'اللَّهُ أَكْبَرُ', target: 34 },
  { label: 'لا إله إلا الله', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', target: 100 },
  { label: 'أستغفر الله', arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', target: 100 },
  { label: 'الصلاة على النبي', arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى مُحَمَّدٍ', target: 10 },
  { label: 'سبحان الله وبحمده', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', target: 100 },
  { label: 'حسبي الله', arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ', target: 7 },
];

export const MILESTONES = [33, 66, 99, 100, 200, 300, 500, 1000];
export const CIRCUMFERENCE = 2 * Math.PI * 115;

export function getMilestoneMsg(n, dhikrLabel) {
  const currentDhikr = dhikrLabel || 'التسبيح';
  const msgs = {
    33: `ثلاثة وثلاثون — ${currentDhikr}! <i class="fas fa-star"></i>`,
    66: `ستة وستون ${currentDhikr} <i class="fas fa-star"></i>`,
    99: `تسعة وتسعون — ${currentDhikr}! الحمد لله <i class="fas fa-star"></i>`,
    100: `مئة ${currentDhikr}! ما شاء الله <i class="fas fa-trophy"></i>`,
    200: `مئتان ${currentDhikr}! <i class="fas fa-trophy"></i>`,
    300: `ثلاثمئة ${currentDhikr}! <i class="fas fa-trophy"></i>`,
    500: `خمسمئة ${currentDhikr}! بارك الله فيك <i class="fas fa-star"></i>`,
    1000: `ألف ${currentDhikr}! ما شاء الله <i class="fas fa-trophy"></i>`,
  };
  return msgs[n] || `${n} ${currentDhikr}! <i class="fas fa-star"></i>`;
}
