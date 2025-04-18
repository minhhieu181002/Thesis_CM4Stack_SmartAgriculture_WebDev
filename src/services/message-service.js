import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { firebaseConfig } from "./firebase";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const db = getFirestore(app);

/**
 * Request notification permission and get FCM token
 * @param {string} userId - Current user ID to store the token
 * @returns {Promise<string|null>} - The FCM token or null if denied
 */
export const requestNotificationPermission = async (userId) => {
  try {
    console.log("Requesting notification permission...");

    // Check if notification permission is already granted
    if (Notification.permission === "granted") {
      console.log("Permission already granted");
    } else {
      const permission = await Notification.requestPermission();
      console.log("Permission:", permission);
      if (permission !== "granted") {
        console.log("Notification permission denied");
        return null;
      }
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_VAPID_KEY,
    });

    console.log("FCM Token:", token);

    // Store token in user document if we have a userId
    if (userId && token) {
      await storeUserToken(userId, token);
    }

    return token;
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
};

/**
 * Store user's FCM token in Firestore
 * @param {string} userId - User ID
 * @param {string} token - FCM token
 */
export const storeUserToken = async (userId, token) => {
  try {
    const userRef = doc(db, "users", userId);

    // Add token to the user's fcmTokens array if it doesn't exist
    await updateDoc(userRef, {
      fcmTokens: arrayUnion(token),
      lastTokenUpdate: new Date(),
    });

    // Subscribe to temperature alerts topic
    await subscribeToTopics(token, [
      "temperature_alerts",
      "humidity_alerts",
      "soil_alerts",
    ]);

    console.log("Token stored successfully for user:", userId);
  } catch (error) {
    console.error("Error storing user token:", error);
  }
};

/**
 * Subscribe a token to an FCM topic
 * @param {string} token - FCM token
 * @param {string} topic - Topic name
 */
export const subscribeToTopics = async (token, topics) => {
  try {
    const response = await fetch(
      "https://smart-agriculture-fcm-topic-manager.onrender.com/api/subscribe-proxy",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, topics }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to subscribe to topic: ${response.statusText}`);
    }

    console.log(`Subscribed to topic: ${topics.join(", ")} successfully`);
    return true;
  } catch (error) {
    console.error(`Error subscribing to topic:`, error);
    return false;
  }
};

/**
 * Register foreground message handler
 * @param {Function} callback - Function to call when a message arrives
 * @returns {Function} - Unsubscribe function
 */
export const onForegroundMessage = (callback) => {
  return onMessage(messaging, (payload) => {
    console.log(
      "Message received in the foreground:",
      JSON.stringify(payload, null, 2)
    );
    callback(payload);
  });
};
