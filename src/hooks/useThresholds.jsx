import { useState, useEffect } from "react";
import { getThresholdBySensorId } from "@/services/firestore-services";

export function useThresholds(sensors, sensorLoading) {
  const [thresholds, setThresholds] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sensorLoading || !sensors || sensors.length === 0) return;
    async function fetchThresholds() {
      setLoading(true);
      setError(null);
      try {
        const thresholdPromises = sensors.map((sensor) =>
          getThresholdBySensorId(sensor.id)
        );
        const thresholdResults = await Promise.all(thresholdPromises);
        const thresholdMap = {};
        sensors.forEach((sensor, index) => {
          thresholdMap[sensor.id] = thresholdResults[index] || null;
        });
        setThresholds(thresholdMap);
      } catch (err) {
        console.error("Error fetching thresholds:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchThresholds();
  }, [sensors, sensorLoading]);
  return { thresholds, loading, error };
}
