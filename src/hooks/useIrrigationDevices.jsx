import { useEffect, useState, useMemo } from "react";
import { useCabinetContext } from "@/context/cabinet-context";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../services/firebase";
import { useSchedulers } from "./useScheduler";

export function useIrrigationDevices() {
  const { outputDevices, areas, loading, error, firstCabinet } =
    useCabinetContext();
  const [pumpData, setPumpData] = useState({});

  const schedulerDevices = useMemo(() => {
    return outputDevices.map((device) => ({
      id: device.id,
      controlMethod: device.controlMethod,
      schedulerId: device.schedulerId,
    }));
  }, [outputDevices]);
  // fetch scheduler for data devices
  const {
    schedulers,
    loading: schedulersLoading,
    error: schedulersError,
  } = useSchedulers(schedulerDevices);
  console.log("the ouput devices", schedulerDevices);
  // Initialize pump data from Firestore
  useEffect(() => {
    if (outputDevices.length > 0) {
      const devices = {};

      outputDevices.forEach((device) => {
        // only include devices of type "pump"
        if (device.type === "pump") {
          const area = areas.find((area) => area.id === device.areaId);
          const areaName = area?.name || "Unknown Area";
          const scheduler = schedulers[device.id];
          devices[device.id] = {
            id: device.id,
            name: device.name || `Pump ${device.id}`,
            area: areaName,
            mode: device.controlMethod || "Manual",
            manualState: device.status === "active",
            schedulerId: device.schedulerId || null,
            schedule: scheduler
              ? {
                  startTime: scheduler.startTime,
                  endTime: scheduler.endTime,
                  status: scheduler.status,
                }
              : null,
          };
        }
      });
      setPumpData(devices);
    }
  }, [outputDevices, areas, schedulers]);

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
    isLoading: loading || schedulersLoading,
    error: error || schedulersError,
  };
}
