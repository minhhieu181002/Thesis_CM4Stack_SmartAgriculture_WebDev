import { createContext, useContext, useState, useEffect } from "react";
import {
  requestNotificationPermission,
  onForegroundMessage,
} from "@/services/message-service.js";
import { toast } from "sonner";
import { UserAuth } from "./auth-context";

const NotificationContext = createContext();
const MAX_NOTIFICATIONS = 50;
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { user, userProfile } = UserAuth();

  // Initialize notifications system
  useEffect(() => {
    // Don't initialize until we have a user
    if (!user || initialized) return;

    const initializeNotifications = async () => {
      try {
        // Request permission and get token
        const token = await requestNotificationPermission(user.uid);
        setPermissionGranted(!!token);

        if (token) {
          console.log("Notifications initialized for user:", user.uid);

          // Load recent notifications from localStorage
          const storedNotifications = localStorage.getItem(
            "recentNotifications"
          );
          if (storedNotifications) {
            try {
              const parsed = JSON.parse(storedNotifications);
              setNotifications(parsed);
            } catch (e) {
              console.error("Failed to parse stored notifications:", e);
            }
          }
        }

        setInitialized(true);
      } catch (error) {
        console.error("Error initializing notifications:", error);
      }
    };

    initializeNotifications();
  }, [user, initialized]);

  // Set up message handler
  useEffect(() => {
    if (!initialized || !permissionGranted) return;

    // Listen for foreground messages
    const unsubscribe = onForegroundMessage((payload) => {
      console.log("Notification received:", payload);

      // Extract temperature data
      const temperatureValue = payload.data?.value || "unknown";
      const timestamp = payload.data?.timestamp
        ? new Date(parseInt(payload.data.timestamp))
        : new Date();

      // Create notification object
      const newNotification = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: payload.notification.title,
        body: payload.notification.body,
        data: payload.data,
        timestamp,
        read: false,
        temperatureValue,
      };

      // Update notifications state
      setNotifications((prev) => {
        const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);

        // Store in localStorage for persistence
        try {
          localStorage.setItem("recentNotifications", JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to store notifications:", e);
        }

        return updated;
      });

      // Show toast notification
      toast(newNotification.title, {
        description: `${newNotification.body} - Temperature: ${temperatureValue}°C`,
        duration: 8000,
      });
    });

    // Clean up subscription
    return () => unsubscribe && unsubscribe();
  }, [initialized, permissionGranted]);

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      );

      // Update localStorage
      localStorage.setItem("recentNotifications", JSON.stringify(updated));

      return updated;
    });
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((notification) => ({
        ...notification,
        read: true,
      }));
      localStorage.setItem("recentNotifications", JSON.stringify(updated));
      return updated;
    });
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem("recentNotifications");
  };

  // Request permission again if previously denied
  const requestPermission = async () => {
    const token = await requestNotificationPermission(user?.uid);
    setPermissionGranted(!!token);
    return !!token;
  };

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        permissionGranted,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        requestPermission,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for accessing notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
