export const PANELS = {
  morning: { title: 'أذكار الصباح', icon: 'fas fa-sun', path: '/morning' },
  evening: { title: 'أذكار المساء', icon: 'fas fa-moon', path: '/evening' },
  salah: { title: 'أذكار بعد الصلاة', icon: 'fas fa-kaaba', path: '/salah' },
  sleep: { title: 'أذكار النوم', icon: 'fas fa-bed', path: '/sleep' },
  various: { title: 'أذكار متنوعة', icon: 'fas fa-gem', path: '/various' },
};

export const NAV_ITEMS = [
  {
    id: 'morning',
    path: '/morning',
    label: 'الصباح',
    fullLabel: 'أذكار الصباح',
    icon: 'fas fa-sun',
  },
  {
    id: 'evening',
    path: '/evening',
    label: 'المساء',
    fullLabel: 'أذكار المساء',
    icon: 'fas fa-moon',
  },
  {
    id: 'salah',
    path: '/salah',
    label: 'الصلاة',
    fullLabel: 'أذكار الصلاة',
    icon: 'fas fa-kaaba',
  },
  {
    id: 'sleep',
    path: '/sleep',
    label: 'النوم',
    fullLabel: 'أذكار النوم',
    icon: 'fas fa-bed',
  },
  {
    id: 'various',
    path: '/various',
    label: 'متنوعة',
    fullLabel: 'أذكار متنوعة',
    icon: 'fas fa-gem',
  },
  {
    id: 'tasbih',
    path: '/tasbih',
    label: 'التسبيح',
    fullLabel: 'التسبيح الرقمي',
    icon: 'fas fa-hands-praying',
  },
];

export const VALID_ROUTES = [
  'morning',
  'evening',
  'salah',
  'sleep',
  'various',
  'tasbih',
];

export const TAB_TITLES = {
  morning: 'أذكار الصباح',
  evening: 'أذكار المساء',
  salah: 'أذكار بعد الصلاة',
  sleep: 'أذكار النوم',
  various: 'أذكار متنوعة',
  tasbih: 'التسبيح الرقمي',
};

export const TAB_DESCRIPTIONS = {
  morning:
    'أذكار الصباح من حصن المسلم - أذكار وأدعية الصباح لتحصين النفس وتقوية الإيمان. أذكار الصباح كاملة من الكتاب والسنة.',
  evening:
    'أذكار المساء من حصن المسلم - أذكار وأدعية المساء للتحصين والحماية من الشرور. أذكار المساء كاملة من السنة النبوية.',
  salah:
    'أذكار بعد الصلاة - أذكار وأدعية مشروعة بعد الصلوات الخمس المفروضة. أذكار ما بعد الصلاة من الكتاب والسنة.',
  sleep:
    'أذكار النوم - أذكار قبل النوم ومنام المسلم من السنة النبوية. أذكار النوم والاستيقاظ كاملة.',
  various:
    'أذكار متنوعة - مجموعة من الأذكار والأدعية الإسلامية لجميع المناسبات اليومية.',
  tasbih:
    'التسبيح الرقمي - عداد تسبيح إلكتروني لتسبيح الله وذكر الله. سبحان الله وبحمده، سبحان الله العظيم.',
};

export function getDefaultTab() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return 'morning';
  if (h >= 17 && h < 21) return 'evening';
  if (h >= 21 || h < 5) return 'sleep';
  return 'morning';
}
