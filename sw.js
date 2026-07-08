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
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});