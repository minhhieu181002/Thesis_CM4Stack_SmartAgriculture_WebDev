import { ref, onValue, off, update } from "firebase/database"; // Import RTDB functions
import { rtdb } from "./firebase"; // Import the initialized RTDB instance
import { Timestamp } from "firebase/firestore";
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

/**
 * Updates the status of an output device in the Realtime Database.
 *
 * @param {string} containerId - The ID of the container (e.g., "container_04")
 * @param {string} deviceId - The ID of the output device (e.g., "outputDevice_1")
 * @param {string} status - The new status ('active' or 'inactive')
 * @returns {Promise<void>} - Promise that resolves when the update is complete
 */
export const updateOutputDeviceStatus = async (
  containerId,
  deviceId,
  status
) => {
  // Input validation
  if (
    !containerId ||
    typeof containerId !== "string" ||
    containerId.trim() === ""
  ) {
    throw new Error(
      "updateOutputDeviceStatus: Invalid or missing containerId."
    );
  }

  if (!deviceId || typeof deviceId !== "string" || deviceId.trim() === "") {
    throw new Error("updateOutputDeviceStatus: Invalid or missing deviceId.");
  }

  if (status !== "active" && status !== "inactive") {
    throw new Error(
      "updateOutputDeviceStatus: Status must be 'active' or 'inactive'."
    );
  }

  // Path to the output device in the database
  const devicePath = `containers/${containerId}/controllers/${deviceId}`;
  console.log(
    `[RTDB Service] Updating device at ${devicePath} to status: ${status}`
  );

  try {
    // Create a reference to the specific device
    const deviceRef = ref(rtdb, devicePath);

    // Update only the status field while preserving other fields
    await update(deviceRef, { status });

    console.log(
      `[RTDB Service] Successfully updated ${deviceId} status to ${status}`
    );
    return true;
  } catch (error) {
    console.error(`[RTDB Service] Error updating device status:`, error);
    throw error;
  }
};

/**
 * Toggles the status of an output device (active ↔ inactive).
 *
 * @param {string} containerId - The ID of the container
 * @param {string} deviceId - The ID of the output device
 * @returns {Promise<string>} - Promise that resolves to the new status after toggling
 */
export const toggleOutputDeviceStatus = async (containerId, deviceId) => {
  try {
    // First get the current status
    const deviceRef = ref(
      rtdb,
      `containers/${containerId}/controllers/${deviceId}`
    );

    // Create a promise to get the current value once
    const snapshot = await new Promise((resolve, reject) => {
      onValue(deviceRef, resolve, { onlyOnce: true }, reject);
    });

    // Check if data exists
    if (!snapshot.exists()) {
      throw new Error(
        `Device ${deviceId} not found in container ${containerId}`
      );
    }

    const deviceData = snapshot.val();
    const currentStatus = deviceData.status || "inactive";

    // Toggle the status
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // Update the status
    await updateOutputDeviceStatus(containerId, deviceId, newStatus);

    return newStatus;
  } catch (error) {
    console.error(`[RTDB Service] Error toggling device status:`, error);
    throw error;
  }
};

export const updateSchedulerTimesRealTime = async (
  containerId,
  schedulerId,
  schedulerData
) => {
  try {
    if (!containerId || !schedulerId) {
      console.error("Invalid container or scheduler Id");
      return false;
    }
    const { startTime, endTime, date } = schedulerData;
    if (!startTime || !endTime || !date) {
      console.error("Invalid schedule data provided");
      return false;
    }
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    // create date object
    const scheduledDate = new Date(date);

    const startDateTime = new Date(scheduledDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(scheduledDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    const startTimestamp = formatTimeString(startDateTime);
    const endTimestamp = formatTimeString(endDateTime);
    const schedulerPath = `containers/${containerId}/${schedulerId}`;
    const schedulerRef = ref(rtdb, schedulerPath);

    let schedulerExists = false;

    await new Promise((resolve) => {
      onValue(
        schedulerRef,
        (snapshot) => {
          schedulerExists = snapshot.exists();
          resolve();
        },
        { onlyOnce: true }
      );
    });

    if (!schedulerExists) {
      console.error(`Scheduler ${schedulerId} not found in RTDB`);
      return false;
    }
    // update document
    console.log(startTimestamp);
    console.log(endTimestamp);
    await update(schedulerRef, {
      startTime: startTimestamp,
      endTime: endTimestamp,
    });
    console.log(
      `Real time schedule updated for scheduler ${schedulerId} successfully`
    );
    return true;
  } catch (err) {
    console.error(`Error updating real time schedule:`, err);
    return false;
  }
};

function formatTimeString(dateObj) {
  // Get the month name
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = months[dateObj.getMonth()];

  // Get the day and year
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();

  // Format hours and minutes with leading zeros if needed
  const hours = dateObj.getHours().toString().padStart(2, "0");
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");
  const seconds = dateObj.getSeconds().toString().padStart(2, "0");

  // Get the timezone offset in hours
  const timezoneOffset = -(dateObj.getTimezoneOffset() / 60);
  const timezoneString = `UTC${
    timezoneOffset >= 0 ? "+" : ""
  }${timezoneOffset}`;

  // Construct the formatted string
  return `${month} ${day}, ${year} at ${hours}:${minutes}:${seconds} ${timezoneString}`;
}
