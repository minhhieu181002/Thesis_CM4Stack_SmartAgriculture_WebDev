importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);
firebase.initializeApp({
  apiKey: "AIzaSyCYWn8LGvRwQelrHxCxO7UYYlPI9lULjNI",
  authDomain: "testing-auth-farm.firebaseapp.com",
  databaseURL:
    "https://testing-auth-farm-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "testing-auth-farm",
  storageBucket: "testing-auth-farm.firebasestorage.app",
  messagingSenderId: "431446924282",
  appId: "1:431446924282:web:14413702187ee3c0bae243",
  measurementId: "G-2B7DEBLDYR",
});
const messaging = firebase.messaging();
// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message:", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/vite.svg",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
