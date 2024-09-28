import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.3/firebase-app.js';
import { getMessaging, getToken } from 'https://www.gstatic.com/firebasejs/9.6.3/firebase-messaging.js';

// Firebase configuration
const firebaseConfig = {

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log(app);
const messaging = getMessaging(app);

// Register the service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
            console.log('Service Worker registered with scope: ', registration.scope);

            // Listen for messages from the service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                const payload = event.data;
                console.log('Message received by service worker: ', payload);
            
                // Emit the event using the Phaser game instance
                const game = window['game']; // Access the global game instance
                game.scene.getScene('chat').events.emit('serviceWorkerMessage', payload);
            });
        })
        .catch((error) => {
            console.error('Service Worker registration failed: ', error);
        });
}

// Function to get FCM registration token
export async function getTokenAndLogToken(): Promise<void> {
    console.log('Getting FCM token...');
    try {
        const currentToken = await getToken(messaging, {
            vapidKey: "BA44dy6ICRa0iL7ebEWj6aPsRqw6R7cx308Ivc7fHAMs6tkJUVFIdJOGXZdLjA8DgET4aQ4dvsaz2qkgPOF1wTo"
        });
        if (currentToken) {
            console.log('FCM Registration Token:', currentToken);
            localStorage.setItem('fcmToken', currentToken); // Store the token in local storage
        } else {
            console.log('No registration token available. Request permission to generate one.');
        }
    } catch (err) {
        console.error('An error occurred while retrieving token.', err);
    }
}

// Function to request notification permission
export function requestPermission(): void {
    console.log('permission status: ', Notification.permission);
    console.log('Requesting permission...');
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            console.log('permission status: ', Notification.permission);
            console.log('Notification permission granted.');
            getTokenAndLogToken();
        }
    });
}
