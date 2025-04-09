import React from "react";
import { useRealtimeSensor } from "@/hooks/useRealtimeSensor";
import { SensorCard } from "./sensors-display";
// Function to parse soil sensor string data
function parseSoilNutrients(soilDataString) {
  // Default values in case parsing fails
  const nutrients = {
    nito: 0,
    kali: 0,
    phospho: 0,
  };

  // Return default if not a string
  if (typeof soilDataString !== "string") {
    return nutrients;
  }

  try {
    // Split the string by commas
    const parts = soilDataString.split(",");

    // Process each part
    parts.forEach((part) => {
      // Extract the letter and number
      const letter = part.charAt(0).toUpperCase();
      const value = parseInt(part.substring(1), 10);

      // Map to the correct nutrient property
      if (letter === "N") nutrients.nito = value;
      if (letter === "K") nutrients.kali = value;
      if (letter === "P") nutrients.phospho = value;
    });

    return nutrients;
  } catch (error) {
    console.error("Error parsing soil nutrients:", error);
    return nutrients;
  }
}
export function RealTimeSensorCard({ sensor, containerId }) {
  // Extract the necessary info from the Firestore sensor data
  const { id: sensorId, type } = sensor;

  // Use the hook to get real-time values for this sensor
  const { sensorData, isLoading, error } = useRealtimeSensor(
    containerId,
    sensorId
  );

  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 animate-pulse flex items-center justify-center min-h-[140px]">
        <span className="text-gray-500">Loading sensor data...</span>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-center min-h-[140px]">
        <span className="text-red-500">Error: {error.message}</span>
      </div>
    );
  }

  // Process soil sensor data if needed
  let nutrientsData = {};
  if (type === "soil" && sensorData) {
    // Handle two possible formats:
    // 1. String format like "K15,N14,P1"
    if (typeof sensorData.value === "string") {
      nutrientsData = parseSoilNutrients(sensorData.value);
      console.log("data of soil sensor is: ", nutrientsData);
    }
    // 2. Object format with nutrients property
    else if (sensorData.nutrients) {
      nutrientsData = {
        nito: sensorData.nutrients.nito || 0,
        kali: sensorData.nutrients.kali || 0,
        phospho: sensorData.nutrients.phospho || 0,
      };
    }
  }

  // Combine the metadata from Firestore with real-time values from RTDB
  const combinedSensorData = {
    ...sensor,
    // Add real-time values
    value: type !== "soil" ? sensorData?.value || 0 : 0,
    status: sensorData?.status || "inactive",
    // For soil sensors, add the parsed nutrients
    ...(type === "soil" && { nutrients: nutrientsData }),
  };

  console.log("Combined Sensor Data:", combinedSensorData);

  // Pass the combined data to the original SensorCard component
  return <SensorCard sensor={combinedSensorData} />;
}
