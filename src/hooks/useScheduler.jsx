import { useState, useEffect, useMemo } from "react";
import { doc, getDoc, collection } from "firebase/firestore";
import { db } from "../services/firebase";
import { Scheduler } from "../models/Scheduler";
import { formatTime } from "../utils/formatTime";

export function useSchedulers(outputDevices = []) {
  const [schedulers, setSchedulers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract only the essential data we need to track for dependencies
  const deviceIdentifiers = useMemo(() => {
    return outputDevices
      .filter(
        (device) =>
          device.controlMethod?.toLowerCase() === "auto" && device.schedulerId
      )
      .map((device) => ({
        id: device.id,
        schedulerId: device.schedulerId,
      }));
  }, [outputDevices]);

  useEffect(() => {
    async function fetchSchedulers() {
      if (!deviceIdentifiers.length) {
        setLoading(false);
        return;
      }

      try {
        const schedulerData = {};
        const schedulersRef = collection(db, "schedules");

        // Use the memoized device identifiers
        for (const device of deviceIdentifiers) {
          const schedulerDoc = await getDoc(
            doc(schedulersRef, device.schedulerId)
          );
          if (schedulerDoc.exists()) {
            const SchedulerObj = Scheduler.fromFirestore(schedulerDoc);
            schedulerData[device.id] = {
              ...SchedulerObj,
              startTime: formatTime(SchedulerObj.startTime),
              endTime: formatTime(SchedulerObj.endTime),
            };
          }
        }

        console.log("Schedulers:", schedulerData);
        setSchedulers(schedulerData);
      } catch (err) {
        console.error("Error fetching schedulers:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSchedulers();
  }, [deviceIdentifiers]); // Only depend on the essential data

  return { schedulers, loading, error };
}
