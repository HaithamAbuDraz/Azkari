import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Renders either a React Icon component (`item.Icon`, e.g., Lucide `Fingerprint`)
 * or a FontAwesome icon class string (`item.icon`).
 */
export default function TabIcon({
  item,
  lucideClassName = 'w-3.5 h-3.5',
  faClassName = 'text-xs',
  className = '',
}) {
  if (!item) return null;

  if (item.Icon) {
    const LucideIcon = item.Icon;
    return (
      <LucideIcon className={cn('shrink-0', lucideClassName, className)} />
    );
  }

  if (item.icon) {
    return (
      <i
        aria-hidden='true'
        className={cn(item.icon, faClassName, className)}
      />
    );
  }

  return null;
}
