import React from "react";

export function TimeLeftIndicator({ timeLeft }) {
  // Determine the color based on time remaining
  let bgColor = "bg-green-500";
  if (timeLeft.hours < 1) {
    bgColor = "bg-red-500";
  } else if (timeLeft.hours < 6) {
    bgColor = "bg-yellow-500";
  }

  // Format the time left
  let timeLeftText = "";
  if (timeLeft.days > 0) {
    timeLeftText = `${timeLeft.days}d ${timeLeft.hours}h`;
  } else if (timeLeft.hours > 0) {
    timeLeftText = `${timeLeft.hours}h ${timeLeft.minutes}m`;
  } else {
    timeLeftText = `${timeLeft.minutes}m`;
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs text-white ${bgColor}`}>
      {timeLeftText}
    </span>
  );
}
