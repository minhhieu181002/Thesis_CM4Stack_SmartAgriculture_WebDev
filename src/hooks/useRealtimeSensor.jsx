// src/hooks/useRealtimeSensor.js
import { useState, useEffect } from "react";
import { listenToSensorData } from "../services/realtime-service"; // Adjust path

/**
 * Custom Hook: Subscribes to real-time updates for a specific sensor
 * from Firebase Realtime Database.
 *
 * @param {string | null | undefined} containerId - The ID of the container. Hook does nothing if null/undefined.
 * @param {string | null | undefined} sensorId - The ID of the sensor. Hook does nothing if null/undefined.
 * @returns {{
 * sensorData: object | null; // The latest sensor data object, or null if not found/loading initially
 * isLoading: boolean; // True until the first data snapshot is received or confirmed non-existent
 * error: Error | null; // Stores any error encountered during listener setup (less common with onValue)
 * }}
 */
export const useRealtimeSensor = (containerId, sensorId) => {
  const [sensorData, setSensorData] = useState(null); // Store the latest data
  const [isLoading, setIsLoading] = useState(true); // Loading until first data arrives
  const [error, setError] = useState(null); // Store potential errors
  console.log(containerId, sensorId);
  useEffect(() => {
    // Only attempt to listen if both IDs are valid strings
    if (!containerId || !sensorId) {
      console.log(
        "[Hook useRealtimeSensor] containerId or sensorId is missing. Skipping listener setup."
      );
      setIsLoading(false); // Not loading if we can't listen
      setSensorData(null); // Ensure data is null
      setError(null);
      return; // Exit the effect
    }

    console.log(
      `[Hook useRealtimeSensor] Setting up listener for ${containerId}/${sensorId}`
    );
    setIsLoading(true); // Set loading true when IDs are valid and we start listening
    setError(null);

    let unsubscribe; // Variable to hold the unsubscribe function

    try {
      // Define the callback function to handle data updates from the service
      const handleDataUpdate = (data) => {
        setSensorData(data); // Update the hook's state with the new data
        setIsLoading(false); // Set loading to false once first data/null is received
      };

      // Call the service function to attach the listener
      unsubscribe = listenToSensorData(containerId, sensorId, handleDataUpdate);
    } catch (err) {
      // Catch errors during the initial listener setup (e.g., invalid IDs passed validation)
      console.error("[Hook useRealtimeSensor] Error setting up listener:", err);
      setError(err);
      setIsLoading(false);
      setSensorData(null);
    }

    // --- Cleanup Function ---
    // This function is returned by useEffect and runs when:
    // 1. The component unmounts.
    // 2. The dependencies (containerId, sensorId) change *before* the effect runs again.
    return () => {
      if (unsubscribe) {
        console.log(
          `[Hook useRealtimeSensor] Cleaning up listener for ${containerId}/${sensorId}`
        );
        unsubscribe(); // Call the unsubscribe function returned by the service
      }
    };
  }, [containerId, sensorId]); // Dependencies: Re-run effect if containerId or sensorId changes

  // Return the current state for the component to use
  return { sensorData, isLoading, error };
};
