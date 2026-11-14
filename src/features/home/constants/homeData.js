import { Fingerprint } from 'lucide-react';
import { createFaIcon } from '../components/IslamicOrnament';
import {
  CONTAINER_STAGGER_VARIANTS,
  ITEM_FADE_UP_VARIANTS,
  CARD_HOVER_SPRING,
} from '../../../constants/motion';

export const containerVariants = CONTAINER_STAGGER_VARIANTS;
export const itemVariants = ITEM_FADE_UP_VARIANTS;
export const cardHoverSpring = CARD_HOVER_SPRING;

/**
 * Icon components mapped by route/category tab ID.
 * Uses solid FontAwesome icons matching tabs.js and Lucide Fingerprint for tasbih.
 */
export const PORTAL_ICONS = {
  morning: createFaIcon('fas fa-sun'),
  evening: createFaIcon('fas fa-moon'),
  salah: createFaIcon('fas fa-kaaba'),
  sleep: createFaIcon('fas fa-bed'),
  various: createFaIcon('fas fa-gem'),
  tasbih: Fingerprint,
  prayers: createFaIcon('fas fa-mosque'),
  progress: createFaIcon('fas fa-chart-line'),
};

/**
 * Daily tracker categories tracked on the homepage radial indicator.
 */
export const DAILY_AZKAR_KEYS = ['morning', 'evening', 'salah', 'sleep'];

/**
 * Category navigation portal definitions for the Sanctuary Hub grid.
 */
export const PORTAL_META = [
  {
    id: 'morning',
    path: '/morning',
    subtitle: 'حصنُ المسلم مع إشراقةِ كلِّ صباح',
    highlightSpan: 'lg:col-span-6',
  },
  {
    id: 'evening',
    path: '/evening',
    subtitle: 'سكينةُ النفس وحفظُ الله عند الأصيل',
    highlightSpan: 'lg:col-span-6',
  },
  {
    id: 'salah',
    path: '/salah',
    subtitle: 'الذكرُ المشروع عقب الصلوات المكتوبات',
    highlightSpan: 'lg:col-span-4',
  },
  {
    id: 'sleep',
    path: '/sleep',
    subtitle: 'وداعُ اليوم بذكرٍ وطمأنينةٍ وأمان',
    highlightSpan: 'lg:col-span-4',
  },
  {
    id: 'various',
    path: '/various',
    subtitle: 'أدعيةُ الخروج والمنزل والضيق والشكر',
    highlightSpan: 'lg:col-span-4',
  },
];
