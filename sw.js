const cacheName = 'cache-v1';
const assets = [
    './',
    './index.html',
    './styles/styles.css',
    './scripts/setupPWA.js',
    './scripts/gameScript.js',
    './scripts/jquery-3.4.1.min.js',
    './scripts/mainScript.js',
    './scripts/gameScript.js',
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

// Add a listener to the install event which is triggered by the install button (this button's functionality is located in setupPWA.js)
self.addEventListener('install', function (event) {
    // This log is for debugging purposes and should be removed when the app goes to production
    console.log('Service Worker Install Event Fired!');
    // The waitUntil() function works similarly to jQuery's .when() function in that it will wait until all the promises have been returned before it fires the event. It is a very well-named function!
    event.waitUntil(
        // We use the .open() method to open the cached that we have named (yet another well-named function) in order to start placing our assets into it
        // This will return a promise
        caches.open(cacheName)
            .then(function (cache) {
                // When the promise is returned (ie. the cache has been opened), we will add all of our assets into it (vanilla Javascript truly has some great function names)
                return cache.addAll(assets);
                // Once this is complete, our assets are now stored on locally on the device therefore allowing our app to work offline
            })
    );
});

// Add a listener to the fetch event. Fetch is essentially vanilla Javascript's version of jQuery's $.ajax. Therefore this event will be fired when the app goes to search the internet for its assets
self.addEventListener('fetch', function (event) {
    // The respondWith() method of the fetch event prevents the browser's default fetch handling (similar to event.preventDefault()), and allows you to provide a custom promise to deal with the response.
    // Without this intervention, anytime the device is offline the app will automatically search the internet and then fail to load the assets when it can't get access rather than searching for the assets that we've already conveniently stored locally on the device's cache.
    event.respondWith(
        // The .match() function checks to see if the assets stored on the cache match the ones that fetch is looking for
        // This returns a promise
        caches.match(event.request)
            .then(function (cachedResource) {
                // Once the promise is returned, we need to check if it is successful.
                // The return function below is really just an IF statement that has been shortened
                // If the assets in the cache DO match the ones that fetch was requesting then return them
                // OR IF they DO NOT match (or are not present) then go to the internet and fetch them (in other words, proceed with the default behaviour that we interrupted with the .respondWith() function)
                return cachedResource || fetch(event.request);
            })
        );
});