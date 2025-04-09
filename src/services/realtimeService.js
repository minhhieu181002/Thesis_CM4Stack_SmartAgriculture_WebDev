import { ref, onValue, off } from "firebase/database"; // Import RTDB functions
import { rtdb } from "./firebase"; // Import the initialized RTDB instance

/**
 * Listens for real-time updates on a specific sensor within a container.
 *
 * @param {string} containerId - The ID of the container (e.g., "container_04").
 * @param {string} sensorId - The ID of the sensor (e.g., "humidSensor1").
 * @param {(data: object | null) => void} callback - Function to call with the sensor data when it changes.
 * Receives the entire sensor object (e.g., { value: 92, status: 'active', ... })
 * or null if the sensor path doesn't exist.
 * @returns {() => void} A function to unsubscribe the listener. Call this when the listener is no longer needed (e.g., on component unmount).
 * @throws {Error} If containerId or sensorId are invalid.
 */
export const listenToSensorData = (containerId, sensorId, callback) => {
  // Input validation
  if (
    !containerId ||
    typeof containerId !== "string" ||
    containerId.trim() === ""
  ) {
    throw new Error("listenToSensorData: Invalid or missing containerId.");
  }
  if (!sensorId || typeof sensorId !== "string" || sensorId.trim() === "") {
    throw new Error("listenToSensorData: Invalid or missing sensorId.");
  }
  if (typeof callback !== "function") {
    throw new Error("listenToSensorData: Callback must be a function.");
  }

  // Construct the path to the specific sensor in the Realtime Database
  // Example path: "containers/container_04/humidSensor1"
  const sensorPath = `containers/${containerId}/${sensorId}`;
  console.log(`[RTDB Service] Setting up listener for path: ${sensorPath}`);

  // Get a reference to the database path
  const sensorRef = ref(rtdb, sensorPath);

  // Attach the real-time listener ('onValue')
  // This listener triggers immediately with the current value and then
  // again whenever the data at sensorRef changes.
  const unsubscribe = onValue(
    sensorRef,
    (snapshot) => {
      // Check if data exists at the specified path
      if (snapshot.exists()) {
        const sensorData = snapshot.val(); // Get the data (the sensor object)
        console.log(
          `[RTDB Service] Data received for ${sensorPath}:`,
          sensorData
        );
        callback(sensorData); // Pass the data to the provided callback function
      } else {
        // Handle cases where the sensor path might not exist (e.g., sensor removed)
        console.warn(`[RTDB Service] No data found at path: ${sensorPath}`);
        callback(null); // Notify the callback that data is missing
      }
    },
    (error) => {
      // Optional: Handle potential errors during listener setup or data fetching
      console.error(`[RTDB Service] Error listening to ${sensorPath}:`, error);
      // You might want to call the callback with an error indicator or throw
      // callback(null, error); // Example: pass error as second argument
    }
  );

  // Return the unsubscribe function provided by onValue.
  // This function detaches the listener when called.
  console.log(`[RTDB Service] Listener attached for ${sensorPath}.`);
  return () => {
    console.log(
      `[RTDB Service] Unsubscribing listener for path: ${sensorPath}`
    );
    off(sensorRef, "value", unsubscribe); // Detach the specific listener
    // Alternatively, just `off(sensorRef)` detaches all listeners at that path
  };
};
