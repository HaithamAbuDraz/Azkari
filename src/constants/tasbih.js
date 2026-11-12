export const INITIAL_DHIKRS = [
  {
    label: 'سبحان الله',
    arabic: 'سُبْحَانَ اللَّهِ',
    target: 33,
    virtue: 'تسبيح وتنزيه لله عز وجل عن كل نقص وعيب.',
  },
  {
    label: 'الحمد لله',
    arabic: 'الْحَمْدُ لِلَّهِ',
    target: 33,
    virtue: 'الحمد لله تملأ الميزان، وهي شكر المنعم على نعمه.',
  },
  {
    label: 'الله أكبر',
    arabic: 'اللَّهُ أَكْبَرُ',
    target: 34,
    virtue: 'تعظيم لله وإقرار بأنه أعظم وأجلّ من كل شيء.',
  },
  {
    label: 'لا إله إلا الله',
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    target: 100,
    virtue: 'أفضل الذكر وكلمة التوحيد الخالصة وعروة الإيمان الوثقى.',
  },
  {
    label: 'أستغفر الله',
    arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    target: 100,
    virtue: 'من لزم الاستغفار جعل الله له من كل هم فرجاً ومن كل ضيق مخرجاً.',
  },
  {
    label: 'الصلاة على النبي',
    arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى مُحَمَّدٍ',
    target: 10,
    virtue: 'من صلّى عليّ صلاةً صلّى الله عليه بها عشراً وحطّ عنه عشر خطيئات.',
  },
  {
    label: 'سبحان الله وبحمده',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    target: 100,
    virtue: 'من قالها مئة مرة حُطّت خطاياه وإن كانت مثل زبد البحر.',
  },
  {
    label: 'سبحان الله العظيم',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    target: 100,
    virtue:
      'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن.',
  },
  {
    label: 'لا حول ولا قوة إلا بالله',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    target: 100,
    virtue: 'كنز من كنوز الجنة وباب عظيم من أبواب الفرج واليقين.',
  },
  {
    label: 'حسبي الله ونعم الوكيل',
    arabic: 'حَسْبِيَ اللَّهُ وَنِعْمَ الْوَكِيلُ',
    target: 7,
    virtue: 'أمان الخائفين وتفويض تام للأمر إلى الله رب العالمين.',
  },
];

export const TARGET_PRESETS = [33, 66, 99, 100, 500, 1000];

export const MILESTONES = [33, 66, 99, 100, 200, 300, 500, 1000];

export const CIRCUMFERENCE = 2 * Math.PI * 115;

export function getMilestoneMsg(n, dhikrLabel) {
  const currentDhikr = dhikrLabel || 'التسبيح';
  const msgs = {
    33: `ثلاثة وثلاثون: ${currentDhikr}! <i class="fas fa-star text-gold"></i>`,
    66: `ستة وستون ${currentDhikr} <i class="fas fa-star text-gold"></i>`,
    99: `تسعة وتسعون: ${currentDhikr}! الحمد لله <i class="fas fa-star text-gold"></i>`,
    100: `مئة ${currentDhikr}! ما شاء الله تبارك الله <i class="fas fa-trophy text-gold"></i>`,
    200: `مئتان ${currentDhikr}! بارك الله في ذكرك <i class="fas fa-trophy text-gold"></i>`,
    300: `ثلاثمئة ${currentDhikr}! تقبل الله طاعتك <i class="fas fa-trophy text-gold"></i>`,
    500: `خمسمئة ${currentDhikr}! إنجاز مبارك <i class="fas fa-star text-gold"></i>`,
    1000: `ألف ${currentDhikr}! طوبى للذاكرين والذاكرات <i class="fas fa-trophy text-gold"></i>`,
  };
  return (
    msgs[n] || `${n} ${currentDhikr}! <i class="fas fa-star text-gold"></i>`
  );
}
