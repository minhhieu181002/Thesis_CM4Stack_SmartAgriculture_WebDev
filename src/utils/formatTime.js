/**
 * Formats a date object or timestamp to a readable time string
 * @param {Date|number|string} dateTime - The date to format
 * @returns {string} Formatted time string (e.g., "7:30 AM")
 */
export function formatTime(dateTime) {
  if (!dateTime) return "Not set";

  try {
    // Handle different input types
    const date = dateTime instanceof Date ? dateTime : new Date(dateTime);

    // Format to hours and minutes in 12-hour format
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Use AM/PM format
    });
  } catch (err) {
    console.error("Error formatting time:", err);
    return "Invalid time";
  }
}
