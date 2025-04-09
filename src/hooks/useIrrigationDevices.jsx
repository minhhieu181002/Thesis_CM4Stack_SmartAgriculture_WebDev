import { useEffect, useState } from "react";
import { useCabinetContext } from "@/Context/CabinetContext";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../services/firebase";

export function useIrrigationDevices() {
  const { outputDevices, areas, loading, error, firstCabinet } =
    useCabinetContext();
  const [pumpData, setPumpData] = useState({});

  // Initialize pump data from Firestore
  useEffect(() => {
    if (outputDevices.length > 0) {
      const devices = {};

      outputDevices.forEach((device) => {
        // only include devices of type "pump"
        if (device.type === "pump") {
          const area = areas.find((area) => area.id === device.areaId);
          const areaName = area?.name || "Unknown Area";

          devices[device.id] = {
            id: device.id,
            name: device.name || `Pump ${device.id}`,
            area: areaName,
            mode: device.controlMethod || "Manual",
            manualState: device.status === "active",
            // You'll need to determine how schedule data is stored in your system
            // This is a placeholder assuming no schedule data
            schedule: device.schedule || null,
          };
        }
      });
      setPumpData(devices);
    }
  }, [outputDevices, areas]);

  // Listen for real-time changes to device statuses in RTDB
  useEffect(() => {
    if (!firstCabinet?.id) return;

    console.log(
      `Setting up real-time listeners for container: ${firstCabinet.id}`
    );

    // Create reference to controllers in RTDB
    const controllersRef = ref(
      rtdb,
      `containers/${firstCabinet.id}/controllers`
    );

    // Set up real-time listener
    const unsubscribe = onValue(
      controllersRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          console.log("No controllers data in RTDB");
          return;
        }

        console.log("Real-time controllers update received:", snapshot.val());

        const controllers = snapshot.val();

        // Update pump data with real-time statuses
        setPumpData((prevData) => {
          const newData = { ...prevData };

          // Update each pump with its current RTDB status
          Object.entries(controllers).forEach(([deviceId, deviceData]) => {
            if (newData[deviceId]) {
              console.log(
                `Updating device ${deviceId} status to: ${deviceData.status}`
              );
              newData[deviceId] = {
                ...newData[deviceId],
                manualState: deviceData.status === "active",
              };
            }
          });

          return newData;
        });
      },
      (error) => {
        console.error("Error listening to controllers:", error);
      }
    );

    // Clean up listener when component unmounts
    return () => {
      console.log("Cleaning up real-time listener");
      unsubscribe();
    };
  }, [firstCabinet?.id]);

  return {
    pumpData,
    isLoading: loading,
    error: error,
  };
}
