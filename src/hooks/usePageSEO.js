import { useEffect } from 'react';

const BASE_URL = 'https://my-azkari.vercel.app';
const DEFAULT_TITLE =
  'أذكاري | أذكار الصباح والمساء، مواقيت الصلاة، والسبحة الإلكترونية';
const DEFAULT_DESCRIPTION =
  'موقع أذكاري - رفيقك اليومي لحصن المسلم: أذكار الصباح والمساء، أذكار بعد الصلاة والنوم، مواقيت الصلاة الدقيقة والأذان، اتجاه القبلة، وسبحة إلكترونية رقمية بتصميم إسلامي هادئ.';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * Helper to update or create a <meta> tag by name or property attribute.
 */
function setMetaTag(attributeName, attributeValue, content) {
  if (typeof document === 'undefined' || !content) return;
  let element = document.querySelector(
    `meta[${attributeName}="${attributeValue}"]`
  );
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Helper to update or create a <link rel="..."> tag.
 */
function setLinkTag(rel, href) {
  if (typeof document === 'undefined' || !href) return;
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Helper to update or create a <link rel="alternate" hreflang="..."> tag.
 */
function setHreflangTag(lang, href) {
  if (typeof document === 'undefined' || !href) return;
  let element = document.querySelector(
    `link[rel="alternate"][hreflang="${lang}"]`
  );
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'alternate');
    element.setAttribute('hreflang', lang);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Helper to update or create the dynamic JSON-LD <script id="dynamic-jsonld"> tag.
 */
function setDynamicJsonLd(schemaData) {
  if (typeof document === 'undefined' || !schemaData) return;
  let script = document.getElementById('dynamic-jsonld');
  if (!script) {
    script = document.createElement('script');
    script.id = 'dynamic-jsonld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schemaData);
}

/**
 * Custom React hook for dynamic SEO management without external libraries.
 * Updates document.title, description, canonical link, hreflang alternates,
 * Open Graph / Twitter tags, and dynamically injects BreadcrumbList JSON-LD.
 *
 * @param {Object} options
 * @param {string} [options.title] - Page title (will be formatted with app name).
 * @param {string} [options.description] - Page meta description.
 * @param {string} [options.path] - Relative route path (e.g., '/morning').
 * @param {string} [options.ogImage] - Optional custom preview image URL.
 */
export function usePageSEO({
  title,
  description,
  path = '',
  ogImage = DEFAULT_IMAGE,
} = {}) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Title formatting
    const rawTitle = title || '';
    const cleanTitle = rawTitle.includes('أذكاري')
      ? rawTitle
      : rawTitle
        ? `${rawTitle} | أذكاري`
        : DEFAULT_TITLE;
    document.title = cleanTitle;

    // 2. Meta description
    const finalDescription = description || DEFAULT_DESCRIPTION;
    setMetaTag('name', 'description', finalDescription);

    // 3. Canonical & Hreflang URLs
    const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '/';
    const canonicalUrl = `${BASE_URL}${cleanPath === '/' ? '/' : cleanPath}`;
    setLinkTag('canonical', canonicalUrl);
    setHreflangTag('ar', canonicalUrl);
    setHreflangTag('x-default', canonicalUrl);

    // 4. Open Graph tags
    setMetaTag('property', 'og:title', cleanTitle);
    setMetaTag('property', 'og:description', finalDescription);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', ogImage);

    // 5. Twitter Card tags
    setMetaTag('name', 'twitter:title', cleanTitle);
    setMetaTag('name', 'twitter:description', finalDescription);
    setMetaTag('name', 'twitter:url', canonicalUrl);
    setMetaTag('name', 'twitter:image', ogImage);

    // 6. Dynamic BreadcrumbList JSON-LD Injection
    const breadcrumbItems = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'الرئيسية',
        item: `${BASE_URL}/`,
      },
    ];

    if (cleanPath !== '/' && cleanPath !== '') {
      const pageLabel = rawTitle.replace(/\s*\|\s*أذكاري.*$/, '').trim();
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 2,
        name: pageLabel || 'الصفحة الحالية',
        item: canonicalUrl,
      });
    }

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems,
    };

    setDynamicJsonLd(breadcrumbSchema);
  }, [title, description, path, ogImage]);
}

export default usePageSEO;
