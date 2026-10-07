/* ==========================================================================
   Retired service worker (kill switch)

   Earlier versions of this site registered a cache-first worker that kept
   serving an outdated index.html to returning visitors. This file replaces
   it: browsers re-check sw.js on navigation, install this version, and it
   removes the old caches, unregisters itself and reloads open tabs from the
   network. It has no fetch handler, so it never serves anything.

   Keep this file at this exact path for at least six months after the last
   cache-first version went out, including after any domain move. Do not
   rename the repository while it is needed: GitHub Pages does not redirect
   project-site URLs after a rename.
   ========================================================================== */

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Only this site's caches: the origin is shared with every other
    // project site under viiotti.github.io.
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('rv-portfolio-')).map((k) => caches.delete(k)));
    await self.registration.unregister();
    const windows = await self.clients.matchAll({ type: 'window' });
    windows.forEach((w) => w.navigate(w.url));
  })());
});
