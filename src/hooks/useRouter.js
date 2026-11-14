import { useState, useEffect, useCallback } from 'react';
import { VALID_ROUTES, TAB_TITLES, TAB_DESCRIPTIONS } from '../constants/tabs';
import { getLocalDateKey } from '../utils/azkar';

// Helper to extract route from current window location (pathname or hash)
export function getRouteFromLocation() {
  if (typeof window === 'undefined') return 'home';

  // 1. Check hash first (e.g., #/morning or #morning)
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  if (hash && VALID_ROUTES.includes(hash)) {
    return hash;
  }

  // 2. Check pathname (e.g., / -> home, /morning -> morning)
  const pathSegments = window.location.pathname
    .replace(/\/+$/, '')
    .split('/')
    .filter(Boolean);

  if (pathSegments.length === 0) {
    try {
      // Prioritize active reading session from today if page was refreshed
      const lastSession = localStorage.getItem('azkari-last-active-session');
      if (lastSession) {
        const parsed = JSON.parse(lastSession);
        const todayKey = getLocalDateKey();
        if (
          parsed?.date === todayKey &&
          parsed?.tabKey &&
          VALID_ROUTES.includes(parsed.tabKey) &&
          parsed.tabKey !== 'home'
        ) {
          return parsed.tabKey;
        }
      }

      const sessionTab = sessionStorage.getItem('azkari-active-tab');
      if (
        sessionTab &&
        VALID_ROUTES.includes(sessionTab) &&
        sessionTab !== 'home'
      ) {
        return sessionTab;
      }
    } catch {
      // Ignore storage errors
    }
    return 'home';
  }

  const lastSegment = pathSegments[pathSegments.length - 1];
  if (lastSegment && VALID_ROUTES.includes(lastSegment)) {
    return lastSegment;
  }

  return null;
}

export function useRouter() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    return getRouteFromLocation() || 'home';
  });

  const syncDocumentMeta = useCallback((route) => {
    if (typeof document === 'undefined') return;

    const mainTitle = 'أذكاري | روضة الأذكار والأدعية';
    const subTitle = route !== 'home' ? TAB_TITLES[route] : '';
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
      const validRoute =
        cleanTarget === ''
          ? 'home'
          : VALID_ROUTES.includes(cleanTarget)
            ? cleanTarget
            : 'home';

      const newPath = validRoute === 'home' ? '/' : `/${validRoute}`;
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

      try {
        if (validRoute === 'home') {
          localStorage.removeItem('azkari-last-active-session');
          sessionStorage.setItem('azkari-active-tab', 'home');
        } else {
          sessionStorage.setItem('azkari-active-tab', validRoute);
        }
      } catch {
        // Ignore storage errors
      }

      if (options.scroll !== false) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [syncDocumentMeta]
  );

  // Sync with browser back/forward buttons (popstate) and hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      const detected = getRouteFromLocation() || 'home';
      setCurrentRoute(detected);
      syncDocumentMeta(detected);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Initial sync: normalize /home or unknown paths cleanly to /
    const initialDetected = getRouteFromLocation();
    if (!initialDetected || initialDetected === 'home') {
      window.history.replaceState({ route: 'home' }, '', '/');
      syncDocumentMeta('home');
    } else {
      if (window.location.pathname !== `/${initialDetected}`) {
        window.history.replaceState(
          { route: initialDetected },
          '',
          `/${initialDetected}`
        );
      }
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
