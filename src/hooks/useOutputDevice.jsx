import { useState, useCallback } from "react";
import {
  updateOutputDeviceStatus,
  toggleOutputDeviceStatus,
} from "../services/realtime-service";
// import { toast } from "sonner";

/**
 * Custom hook for controlling output devices in the RTDB
 *
 * @param {string} containerId - The container ID
 * @returns {Object} Methods and state for controlling output devices
 */
export function useOutputDevice(containerId) {
  const [isUpdating, setIsUpdating] = useState(false);
  // function to update the status of an output device
  const setDeviceStatus = useCallback(
    async (deviceId, status) => {
      if (!containerId || !deviceId) return;
      setIsUpdating(true);
      try {
        await updateOutputDeviceStatus(containerId, deviceId, status);
        // toast(`Device ${deviceId} updated to ${status}`);

        return true;
      } catch (error) {
        console.error("Failed to update device:", error);
        // toast.error(`Update failed: ${error.message}`);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [containerId]
  );
  // Function to toggle a device's status
  const toggleDevice = useCallback(
    async (deviceId) => {
      if (!containerId || !deviceId) return;

      setIsUpdating(true);
      try {
        const newStatus = await toggleOutputDeviceStatus(containerId, deviceId);
        // toast.success("Device toggled", {
        //   description: `${deviceId} is now ${newStatus}`,
        // });
        return newStatus;
      } catch (error) {
        console.error("Failed to toggle device:", error);
        // toast.error(`Toggle failed: ${error.message}`);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [containerId]
  );

  return {
    setDeviceStatus,
    toggleDevice,
    isUpdating,
  };
}
