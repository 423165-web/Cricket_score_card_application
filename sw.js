const CACHE_NAME = 'cricket-score-app-v1';
const URLS_TO_CACHE = [
  '.', // Represents the root of the directory, which will be index.html or equivalent
  'HomePage.html',
  'NewMatch.html',
  'SelectPlayers.html',
  'LiveScoring.html',
  'Scorecard.html',
  'Toss.html',
  'HomePage.css',
  'LiveScoring.css',
  'WicketModal.css',
  'NewOverModal.css',
  'ExtraRunModal.css',
  'NewMatch.css',
  'SelectPlayers.css',
  'Scorecard.css',
  'Toss.css',
  'HomePage.js',
  'NewMatch.js',
  'SelectPlayers.js',
  'LiveScoring.js',
  'Scorecard.js',
  'Toss.js',
  'manifest.json',
  'images/icon-192.png',
  'images/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  // Use a stale-while-revalidate strategy
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Check if we received a valid response to cache
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();
            cache.put(event.request, responseToCache);
          }
          return networkResponse;
        });

        // Return the cached response immediately if available, otherwise wait for the network
        return cachedResponse || fetchPromise;
      });
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // If this cache name is not in our whitelist, delete it.
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});