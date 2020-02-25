const installButton = document.querySelector('#installButton');

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js')
        .then(function (response) {
            console.log('SW Registration Successful!', response);
        }).catch(function (error) {
            console.log('SW Registration Unsuccessful!', error);
        });
    });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    console.log('before install prompt fired', event);
    deferredPrompt = event;
    installButton.classList.remove('hidden');
});

installButton.addEventListener('click', function () {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function(choiceResult) {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
        }
        deferredPrompt = null;
    });
    installButton.classList.add('hidden');
});

if (window.matchMedia('(display-mode: standalone)').matches) {  
    installButton.classList.add('hidden');
}