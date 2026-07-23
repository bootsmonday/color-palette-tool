// Normalize GitHub Pages 404 SPA redirect URLs (/?/path&query=...) back to clean paths.
const search = window.location.search;

if (search.startsWith('?/')) {
  const decoded = search.slice(1).replace(/~and~/g, '&');
  const [routePath, ...queryParts] = decoded.split('&');
  const query = queryParts.length ? `?${queryParts.join('&')}` : '';

  const basePath = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  const normalizedRoutePath = routePath.startsWith('/') ? routePath : `/${routePath}`;
  const pathname = `${basePath}${normalizedRoutePath}` || '/';

  window.history.replaceState(null, '', `${pathname}${query}${window.location.hash}`);
}
