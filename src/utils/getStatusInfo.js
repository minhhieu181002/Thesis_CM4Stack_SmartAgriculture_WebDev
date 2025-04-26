export function getStatusInfo(pump) {
  if (!pump) return { text: "Unknown", colorClass: "text-gray-500" };

  if (pump.mode === "Manual") {
    return pump.manualState
      ? { text: "ON", colorClass: "text-green-600" }
      : { text: "OFF", colorClass: "text-red-600" };
  } else {
    // Auto mode
    if (pump.schedule) {
      return {
        text: "Scheduled",
        colorClass: "text-blue-600",
        startTime: pump.schedule.startTime,
        endTime: pump.schedule.endTime,
      };
    } else {
      return { text: "No Schedule", colorClass: "text-gray-500" };
    }
  }
}
