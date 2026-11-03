import { useState, useEffect, useCallback } from 'react';
import {
  VALID_ROUTES,
  getDefaultTab,
  TAB_TITLES,
  TAB_DESCRIPTIONS,
} from '../constants/tabs';

// Helper to extract route from current window location (pathname or hash)
export function getRouteFromLocation() {
  if (typeof window === 'undefined') return null;

  // 1. Check hash first (e.g., #/morning or #morning)
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  if (hash && VALID_ROUTES.includes(hash)) {
    return hash;
  }

  // 2. Check pathname (e.g., /morning or /azkari/morning)
  const pathSegments = window.location.pathname
    .replace(/\/+$/, '')
    .split('/')
    .filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1];

  if (lastSegment && VALID_ROUTES.includes(lastSegment)) {
    return lastSegment;
  }

  return null;
}

export function useRouter() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    return getRouteFromLocation() || getDefaultTab();
  });

  const syncDocumentMeta = useCallback((route) => {
    if (typeof document === 'undefined') return;

    const mainTitle = 'أذكاري — روضة الأذكار والأدعية';
    const subTitle = TAB_TITLES[route];
    document.title = subTitle ? `${mainTitle} | ${subTitle}` : mainTitle;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && TAB_DESCRIPTIONS[route]) {
      metaDescription.setAttribute('content', TAB_DESCRIPTIONS[route]);
    }
  }, []);

  const navigate = useCallback(
    (target, options = {}) => {
      const cleanTarget = String(target)
        .replace(/^\/?(#[/])?/, '')
        .replace(/\/+$/, '');
      const validRoute = VALID_ROUTES.includes(cleanTarget)
        ? cleanTarget
        : getDefaultTab();

      const newPath = `/${validRoute}`;
      const currentPath = window.location.pathname;

      if (currentPath !== newPath || options.replace) {
        if (options.replace) {
          window.history.replaceState({ route: validRoute }, '', newPath);
        } else {
          window.history.pushState({ route: validRoute }, '', newPath);
        }
      }

      setCurrentRoute(validRoute);
      syncDocumentMeta(validRoute);

      if (options.scroll !== false) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [syncDocumentMeta]
  );

  // Sync with browser back/forward buttons (popstate) and hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      const detected = getRouteFromLocation() || getDefaultTab();
      setCurrentRoute(detected);
      syncDocumentMeta(detected);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Initial sync: If user visited root '/', update URL to current default tab without reload
    const initialDetected = getRouteFromLocation();
    if (!initialDetected) {
      const defaultTab = getDefaultTab();
      window.history.replaceState({ route: defaultTab }, '', `/${defaultTab}`);
      syncDocumentMeta(defaultTab);
    } else {
      syncDocumentMeta(initialDetected);
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [syncDocumentMeta]);

  return {
    currentRoute,
    navigate,
  };
}
