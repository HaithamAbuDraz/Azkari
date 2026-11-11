// Constants, calculation methods, popular cities and Qibla math for Prayer Times

export const KAABA_COORDS = {
  lat: 21.422487,
  lng: 39.826206,
};

// 6 main prayer items to display
export const PRAYER_KEYS = [
  { key: 'Fajr', label: 'الفجر', icon: 'fas fa-cloud-sun', desc: 'صلاة الفجر' },
  { key: 'Sunrise', label: 'الشروق', icon: 'fas fa-sun', desc: 'شروق الشمس' },
  { key: 'Dhuhr', label: 'الظهر', icon: 'fas fa-sun', desc: 'صلاة الظهر' },
  { key: 'Asr', label: 'العصر', icon: 'fas fa-cloud-sun', desc: 'صلاة العصر' },
  {
    key: 'Maghrib',
    label: 'المغرب',
    icon: 'fas fa-cloud-moon',
    desc: 'صلاة المغرب',
  },
  { key: 'Isha', label: 'العشاء', icon: 'fas fa-moon', desc: 'صلاة العشاء' },
];

// Alert Types for Prayer Arrival
export const ALERT_TYPES = [
  {
    id: 'full_adhan',
    label: 'أذان كامل',
    icon: 'fas fa-mosque',
    desc: 'تشغيل الأذان كاملاً بصوت المؤذن المختار',
  },
  {
    id: 'short_reminder',
    label: 'تنبيه صوتي ناطق',
    icon: 'fas fa-bullhorn',
    desc: 'نطق صوتي: "حان الآن موعد أذان صلاة {اسم الصلاة}"',
  },
  {
    id: 'takbeerat',
    label: 'تكبيرات فقط',
    icon: 'fas fa-volume-low',
    desc: 'تكبيرات الأذان الأولى (الله أكبر الله أكبر)',
  },
  {
    id: 'chime',
    label: 'رنين خافت',
    icon: 'fas fa-bell',
    desc: 'نغمة تنبيهية لطيفة وهادئة',
  },
];

// Available Muezzin voices (Optimized local audio assets for fast instant playback)
export const DEFAULT_ADHAN_URL = '/assets/audio/adhan.mp3?v=2';

export const MUEZZINS = [
  {
    id: 'mishary',
    name: 'الشيخ مشاري راشد العفاسي',
    location: 'محلي (دون إنترنت) والكويت',
    url: '/assets/audio/adhan.mp3?v=2',
    fallbackUrl: DEFAULT_ADHAN_URL,
  },
  {
    id: 'ali_mulla',
    name: 'الشيخ علي ملا',
    location: 'أذان المسجد الحرام بمكة المكرمة',
    url: '/assets/audio/adhans/ali_mulla.mp3?v=2',
    fallbackUrl: DEFAULT_ADHAN_URL,
  },
  {
    id: 'madinah',
    name: 'أذان المسجد النبوي الشريف',
    location: 'المدينة المنورة',
    url: '/assets/audio/adhans/madinah.mp3?v=2',
    fallbackUrl: DEFAULT_ADHAN_URL,
  },
  {
    id: 'aqsa',
    name: 'أذان المسجد الأقصى المبارك',
    location: 'القدس الشريف',
    url: '/assets/audio/adhans/aqsa.mp3?v=2',
    fallbackUrl: DEFAULT_ADHAN_URL,
  },
  {
    id: 'abdulbasit',
    name: 'الشيخ عبد الباسط عبد الصمد',
    location: 'جمهورية مصر العربية',
    url: '/assets/audio/adhans/abdulbasit.mp3?v=2',
    fallbackUrl: DEFAULT_ADHAN_URL,
  },
  {
    id: 'alnafees',
    name: 'الشيخ أحمد النفيس',
    location: 'الكويت',
    url: '/assets/audio/adhans/alnafees.mp3?v=2',
    fallbackUrl: DEFAULT_ADHAN_URL,
  },
  {
    id: 'zahrani',
    name: 'الشيخ منصور الزهراني',
    location: 'المملكة العربية السعودية',
    url: '/assets/audio/adhans/zahrani.mp3?v=2',
    fallbackUrl: DEFAULT_ADHAN_URL,
  },
  {
    id: 'turkey',
    name: 'حافظ مصطفى أوزجان',
    location: 'تركيا',
    url: '/assets/audio/adhans/turkey.mp3?v=2',
    fallbackUrl: DEFAULT_ADHAN_URL,
  },
];

// Calculation methods supported by Aladhan API
export const CALCULATION_METHODS = [
  { id: 4, name: 'جامعة أم القرى (مكة المكرمة)' },
  { id: 5, name: 'الهيئة المصرية العامة للمساحة' },
  { id: 3, name: 'رابطة العالم الإسلامي' },
  { id: 2, name: 'الاتحاد الإسلامي لأمريكا الشمالية (ISNA)' },
  { id: 1, name: 'جامعة العلوم الإسلامية بكراتشي' },
  { id: 8, name: 'منطقة الخليج ودولة الإمارات' },
  { id: 9, name: 'دائرة الشؤون الدينية بتركيا' },
  { id: 12, name: 'وزارة الأوقاف والشؤون الإسلامية (فرنسا)' },
];

// Curated list of popular Arab and Islamic cities for instant 1-tap switching
export const POPULAR_CITIES = [
  {
    city: 'Makkah',
    label: 'مكة المكرمة',
    country: 'Saudi Arabia',
    countryLabel: 'السعودية',
    lat: 21.4225,
    lng: 39.8262,
    method: 4,
  },
  {
    city: 'Madinah',
    label: 'المدينة المنورة',
    country: 'Saudi Arabia',
    countryLabel: 'السعودية',
    lat: 24.4672,
    lng: 39.6111,
    method: 4,
  },
  {
    city: 'Riyadh',
    label: 'الرياض',
    country: 'Saudi Arabia',
    countryLabel: 'السعودية',
    lat: 24.7136,
    lng: 46.6753,
    method: 4,
  },
  {
    city: 'Cairo',
    label: 'القاهرة',
    country: 'Egypt',
    countryLabel: 'مصر',
    lat: 30.0444,
    lng: 31.2357,
    method: 5,
  },
  {
    city: 'Jerusalem',
    label: 'القدس الشريف',
    country: 'Palestine',
    countryLabel: 'فلسطين',
    lat: 31.7683,
    lng: 35.2137,
    method: 3,
  },
  {
    city: 'Dubai',
    label: 'دبي',
    country: 'United Arab Emirates',
    countryLabel: 'الإمارات',
    lat: 25.2048,
    lng: 55.2708,
    method: 8,
  },
  {
    city: 'Amman',
    label: 'عمّان',
    country: 'Jordan',
    countryLabel: 'الأردن',
    lat: 31.9454,
    lng: 35.9284,
    method: 3,
  },
  {
    city: 'Kuwait City',
    label: 'الكويت',
    country: 'Kuwait',
    countryLabel: 'الكويت',
    lat: 29.3759,
    lng: 47.9774,
    method: 8,
  },
  {
    city: 'Doha',
    label: 'الدوحة',
    country: 'Qatar',
    countryLabel: 'قطر',
    lat: 25.2854,
    lng: 51.531,
    method: 8,
  },
  {
    city: 'Rabat',
    label: 'الرباط',
    country: 'Morocco',
    countryLabel: 'المغرب',
    lat: 34.0209,
    lng: -6.8416,
    method: 3,
  },
  {
    city: 'Algiers',
    label: 'الجزائر',
    country: 'Algeria',
    countryLabel: 'الجزائر',
    lat: 36.7538,
    lng: 3.0588,
    method: 3,
  },
  {
    city: 'Tunis',
    label: 'تونس',
    country: 'Tunisia',
    countryLabel: 'تونس',
    lat: 36.8065,
    lng: 10.1815,
    method: 3,
  },
  {
    city: 'Istanbul',
    label: 'إسطنبول',
    country: 'Turkey',
    countryLabel: 'تركيا',
    lat: 41.0082,
    lng: 28.9784,
    method: 9,
  },
  {
    city: 'Baghdad',
    label: 'بغداد',
    country: 'Iraq',
    countryLabel: 'العراق',
    lat: 33.3152,
    lng: 44.3661,
    method: 3,
  },
  {
    city: 'Beirut',
    label: 'بيروت',
    country: 'Lebanon',
    countryLabel: 'لبنان',
    lat: 33.8938,
    lng: 35.5018,
    method: 3,
  },
  {
    city: 'Muscat',
    label: 'مسقط',
    country: 'Oman',
    countryLabel: 'عُمان',
    lat: 23.588,
    lng: 58.3829,
    method: 8,
  },
  {
    city: 'Manama',
    label: 'المنامة',
    country: 'Bahrain',
    countryLabel: 'البحرين',
    lat: 26.2285,
    lng: 50.586,
    method: 8,
  },
];

// Offline fallback timings (Makkah approx standard)
export const FALLBACK_TIMINGS = {
  Fajr: '05:05',
  Sunrise: '06:25',
  Dhuhr: '12:05',
  Asr: '15:25',
  Maghrib: '17:45',
  Isha: '19:15',
};

/**
 * Calculates exact great-circle Qibla bearing in degrees clockwise from True North (0-360°)
 */
export function calculateQiblaDirection(lat, lng) {
  const phi1 = (lat * Math.PI) / 180;
  const phi2 = (KAABA_COORDS.lat * Math.PI) / 180;
  const deltaLambda = ((KAABA_COORDS.lng - lng) * Math.PI) / 180;

  const y = Math.sin(deltaLambda);
  const x =
    Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  qibla = (qibla + 360) % 360;
  return Math.round(qibla * 10) / 10;
}

/**
 * Default Aladhan calculation method IDs mapped by ISO-3166 alpha-2 country code.
 */
const COUNTRY_CALCULATION_METHODS = {
  SA: 4, // Umm al-Qura
  EG: 5, // Egyptian General Authority of Survey
  AE: 8, // Gulf Region
  KW: 8,
  QA: 8,
  OM: 8,
  BH: 8,
  TR: 9, // Diyanet (Turkey)
  FR: 12, // UOIF (France)
  US: 2, // ISNA
  CA: 2,
  PK: 1, // University of Islamic Sciences, Karachi
  IN: 1,
  BD: 1,
};

/**
 * Returns the recommended Aladhan calculation method ID for a country code.
 */
export function getRecommendedMethod(countryCode) {
  if (!countryCode) return 3; // Muslim World League fallback
  return COUNTRY_CALCULATION_METHODS[countryCode.toUpperCase()] || 3;
}

/**
 * Calculates great-circle distance between two coordinates in kilometers (Haversine formula).
 */
export function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Calculates great-circle distance from coordinates to the Kaaba in kilometers.
 */
export function calculateDistanceToKaaba(lat, lng) {
  return calculateDistanceKm(lat, lng, KAABA_COORDS.lat, KAABA_COORDS.lng);
}

/**
 * Converts 24h format time string "15:45" to formatted 12-hour Arabic representation e.g. "03:45 م"
 */
export function formatPrayerTime12h(time24) {
  if (!time24) return '--:--';
  // Strip any suffix like (EST) if present
  const clean = time24.split(' ')[0];
  const [hStr, mStr] = clean.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return clean;

  const isPm = h >= 12;
  h = h % 12;
  if (h === 0) h = 12;
  const padH = h.toString().padStart(2, '0');
  const period = isPm ? 'م' : 'ص';
  return `${padH}:${m} ${period}`;
}
