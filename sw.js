const cacheName = 'cache-v1';
const assets = [
    './',
    './index.html',
    // './manifest.json',
    // './sw.js',
    './styles/styles.css',
    './scripts/setupPWA.js',
    './scripts/gameScript.js',
    './scripts/jquery-3.4.1.min.js',
    './scripts/mainScript.js',
    './assets/icons/icon-192x192.png',
    './assets/icons/icon-512x512.png',
    './assets/favicons/android-chrome-192x192.png',
    './assets/favicons/android-chrome-512x512.png',
    './assets/favicons/apple-touch-icon.png',
    './assets/favicons/favicon-16x16.png',
    './assets/favicons/favicon-32x32.png',
    './assets/favicons/favicon.ico',
    './assets/audio/music/track01-DontBeA.mp3',
    './assets/audio/music/track02-LavaFlow.mp3',
    './assets/audio/music/track03-GameAtHeart.mp3',
    './assets/audio/music/track04-FerrousRage.mp3',
    './assets/audio/music/track05-FrigidTriumph.mp3',
    './assets/audio/music/track06-ReallyDangerous.mp3',
    './assets/audio/sfx/explosion.ogg',
    './assets/audio/sfx/pew.wav',
    './assets/audio/sfx/pickup.wav',
    './assets/icons/bigBlueShipIcon.png',
    './assets/icons/biggerRedShipIcon.png',
    './assets/icons/bigGreenShipIcon.png',
    './assets/icons/bigRedShipIcon.png',
    './assets/icons/cursorKeyLeft.png',
    './assets/icons/cursorKeyRight.png',
    './assets/icons/greenShipIcon.png',
    './assets/icons/handTapping.png',
    './assets/icons/handTappingAndMoving.png',
    './assets/icons/mouse.png',
    './assets/icons/mouseClick.png',
    './assets/icons/mouseMove.png',
    './assets/icons/redSilverShipIcon.png',
    './assets/icons/sleekBlueShipIcon.png',
    './assets/icons/spacebar.png',
    './assets/pickups/healthPickup.png',
    './assets/pickups/homingMissilePickup.png',
    './assets/pickups/nukePickup.png',
    './assets/pickups/singleShotPickup.png',
    './assets/pickups/sloMoPickup.png',
    './assets/pickups/spreadPickup.png',
    './assets/ships/bigBlueShip.gif',
    './assets/ships/biggerRedShip.gif',
    './assets/ships/bigGreenShip.gif',
    './assets/ships/bigRedShip.gif',
    './assets/ships/greenShip.gif',
    './assets/ships/redSilverShip.gif',
    './assets/ships/sleekBlueShip.gif',
    './assets/explosion.gif',
    './assets/green_bullet.gif',
    './assets/magenta_bullet.gif',
    './assets/pixelSpace.png',
    './assets/red_bullet.gif',
    './assets/fonts/bangers-regular-webfont.woff',
    './assets/fonts/bangers-regular-webfont.woff2',
    './assets/fonts/pressstart2p-regular-webfont.woff',
    './assets/fonts/pressstart2p-regular-webfont.woff2'
];

self.addEventListener('install', function (event) {
    console.log('Service Worker Install Event Fired!');
    event.waitUntil(
        caches.open(cacheName)
            .then(function (cache) {
                return cache.addAll(assets);
            }).catch(function (error) {
                console.log('Error:', error);
            })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (cachedResource) {
                return cachedResource || fetch(event.request);
            })
        );
});