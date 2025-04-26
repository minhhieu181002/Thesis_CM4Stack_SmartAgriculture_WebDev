import { useState, useEffect } from "react";
import { useCabinetContext } from "@/context/cabinet-context";
import {
  getOutputDevicesByContainerId,
  getSchedulerById,
} from "@/services/firestore-services";
import { differenceInMilliseconds } from "date-fns";
import { DropletIcon } from "lucide-react";

export function useScheduledTasks() {
  const { firstCabinet } = useCabinetContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchScheduledTasks() {
      if (!firstCabinet?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get all output devices for this cabinet
        const devices = await getOutputDevicesByContainerId(firstCabinet.id);

        // Filter to get only devices in Auto mode with a schedulerId
        const autoDevices = devices.filter(
          (device) => device.controlMethod === "Auto" && device.schedulerId
        );

        if (autoDevices.length === 0) {
          setTasks([]);
          setLoading(false);
          return;
        }

        // Get scheduler documents for each device
        const tasksData = [];

        for (const device of autoDevices) {
          // Get scheduler document from Firestore
          const schedulerData = await getSchedulerById(device.schedulerId);

          if (schedulerData) {
            // Safely convert startTime to a Date object regardless of input format
            let startDateTime;

            // Handle different formats of startTime
            if (schedulerData.startTime instanceof Date) {
              // Already a Date object
              startDateTime = schedulerData.startTime;
            } else if (
              typeof schedulerData.startTime === "object" &&
              schedulerData.startTime?.toDate
            ) {
              // Firestore Timestamp object
              startDateTime = schedulerData.startTime.toDate();
            } else if (typeof schedulerData.startTime === "string") {
              // ISO string or time string like "08:30"
              if (schedulerData.startTime.includes(":")) {
                // It's a time string like "08:30"
                const [hours, minutes] = schedulerData.startTime
                  .split(":")
                  .map(Number);
                const dateStr =
                  schedulerData.date || new Date().toISOString().split("T")[0];
                startDateTime = new Date(dateStr);
                startDateTime.setHours(hours, minutes, 0, 0);
              } else {
                // Assume ISO string
                startDateTime = new Date(schedulerData.startTime);
              }
            } else if (typeof schedulerData.startTime === "number") {
              // Unix timestamp in seconds or milliseconds
              startDateTime = new Date(
                schedulerData.startTime > 9999999999
                  ? schedulerData.startTime // milliseconds
                  : schedulerData.startTime * 1000 // seconds to milliseconds
              );
            } else {
              console.error(
                "Unknown startTime format:",
                schedulerData.startTime
              );
              continue; // Skip this scheduler
            }

            // Only include future tasks
            const now = new Date();
            if (startDateTime > now) {
              // Calculate time remaining
              const timeLeftMs = differenceInMilliseconds(startDateTime, now);

              // Calculate days, hours, minutes
              const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
              const hours = Math.floor(
                (timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
              );
              const minutes = Math.floor(
                (timeLeftMs % (1000 * 60 * 60)) / (1000 * 60)
              );

              // Format display times
              const startTimeDisplay = startDateTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              let endTimeDisplay = "";
              if (schedulerData.endTime) {
                // Apply same conversion logic for endTime if needed
                let endDateTime;
                // Similar conversion logic for endTime...
                if (schedulerData.endTime instanceof Date) {
                  endDateTime = schedulerData.endTime;
                } else if (
                  typeof schedulerData.endTime === "object" &&
                  schedulerData.endTime?.toDate
                ) {
                  endDateTime = schedulerData.endTime.toDate();
                } else if (typeof schedulerData.endTime === "string") {
                  if (schedulerData.endTime.includes(":")) {
                    const [hours, minutes] = schedulerData.endTime
                      .split(":")
                      .map(Number);
                    const dateStr =
                      schedulerData.date ||
                      new Date().toISOString().split("T")[0];
                    endDateTime = new Date(dateStr);
                    endDateTime.setHours(hours, minutes, 0, 0);
                  } else {
                    endDateTime = new Date(schedulerData.endTime);
                  }
                } else if (typeof schedulerData.endTime === "number") {
                  endDateTime = new Date(
                    schedulerData.endTime > 9999999999
                      ? schedulerData.endTime
                      : schedulerData.endTime * 1000
                  );
                }

                if (endDateTime) {
                  endTimeDisplay = endDateTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }
              }

              // Format the date for display
              const dateDisplay = startDateTime.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              tasksData.push({
                id: device.schedulerId,
                deviceId: device.id,
                title: `${device.name} will turn on`,
                subtitle: `Scheduled activation`,
                date: dateDisplay,
                startTime: startTimeDisplay,
                endTime: endTimeDisplay || "N/A",
                timeLeft: { days, hours, minutes },
                icon: <DropletIcon className="h-6 w-6 text-blue-500" />,
                onEdit: () => {
                  console.log("Edit schedule for device:", device.id);
                  // Ideally, you would have a function to open the schedule modal here
                },
              });
            }
          }
        }

        // Sort tasks by closest time first
        tasksData.sort((a, b) => {
          const aTime =
            a.timeLeft.days * 24 * 60 +
            a.timeLeft.hours * 60 +
            a.timeLeft.minutes;
          const bTime =
            b.timeLeft.days * 24 * 60 +
            b.timeLeft.hours * 60 +
            b.timeLeft.minutes;
          return aTime - bTime;
        });

        setTasks(tasksData);
        setError(null);
      } catch (err) {
        console.error("Error fetching scheduled tasks:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchScheduledTasks();

    // Set up an interval to refresh the time left every minute
    const intervalId = setInterval(fetchScheduledTasks, 60000);

    return () => clearInterval(intervalId);
  }, [firstCabinet?.id]);

  return { tasks, loading, error };
}
