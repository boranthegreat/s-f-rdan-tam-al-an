const CACHE_NAME = "btg-shell-v5-live";
const OFFLINE_URLS = ["/tr/offline", "/en/offline", "/el/offline"];
const PUSH_CACHE = "btg-push-state";
const PUSH_TOKEN_URL = "/__btg_push_token__";
const LOCALE_URL = "/__btg_locale__";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(["/tr", "/en", "/el", ...OFFLINE_URLS, "/manifest.webmanifest", "/icon.svg", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png"])).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME && key !== PUSH_CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(async () => {
      const cachedPage = await caches.match(event.request);
      if (cachedPage) return cachedPage;
      const first = new URL(event.request.url).pathname.split("/").filter(Boolean)[0];
      const locale = first === "en" || first === "el" ? first : "tr";
      const offlinePage = await caches.match(`/${locale}/offline`);
      if (offlinePage) return offlinePage;
      const message = locale === "en" ? "You are offline." : locale === "el" ? "Δεν υπάρχει σύνδεση στο διαδίκτυο." : "İnternet bağlantısı yok.";
      return new Response(message, { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((response) => {
        if (response.ok && ["style", "script", "image", "font"].includes(event.request.destination)) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
        }
        return response;
      });
      return cached || network;
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SET_PUSH_TOKEN" && event.data.token) {
    event.waitUntil(caches.open(PUSH_CACHE).then((cache) => cache.put(PUSH_TOKEN_URL, new Response(event.data.token))));
  }
  if (event.data?.type === "CLEAR_PUSH_TOKEN") {
    event.waitUntil(caches.open(PUSH_CACHE).then((cache) => cache.delete(PUSH_TOKEN_URL)));
  }
  if (event.data?.type === "SET_LOCALE" && ["tr", "en", "el"].includes(event.data.locale)) {
    event.waitUntil(caches.open(PUSH_CACHE).then((cache) => cache.put(LOCALE_URL, new Response(event.data.locale))));
  }
});

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PUSH_CACHE);
      const localeResponse = await cache.match(LOCALE_URL);
      const locale = localeResponse ? await localeResponse.text() : "tr";
      let message = locale === "en"
        ? { title: "BoranTheGreat price alert", body: "One of your tracked price targets has been reached.", url: "/en/alerts" }
        : locale === "el"
          ? { title: "Ειδοποίηση τιμής BoranTheGreat", body: "Επιτεύχθηκε ένας από τους στόχους τιμής που παρακολουθείς.", url: "/el/alerts" }
          : { title: "BoranTheGreat fiyat alarmı", body: "Takip ettiğin fiyat hedeflerinden biri gerçekleşti.", url: "/tr/alerts" };
      try {
        const tokenResponse = await cache.match(PUSH_TOKEN_URL);
        const token = tokenResponse ? await tokenResponse.text() : "";
        if (token) {
          const response = await fetch(`/api/push/pending?token=${encodeURIComponent(token)}`, { cache: "no-store" });
          if (response.ok) message = { ...message, ...(await response.json()) };
        }
      } catch {
        // The generic notification remains available when the network is offline.
      }
      await self.registration.showNotification(message.title, {
        body: message.body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "btg-price-alert",
        renotify: true,
        data: { url: message.url }
      });
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/tr/alerts";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => "focus" in client);
      if (existing) {
        existing.navigate(url);
        return existing.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
