import { useState, useEffect } from "react";
import { getSensorsByAreaId } from "@/services/firestoreServices";

export function useAreaSensor(areaId) {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSensors() {
      if (!areaId) {
        setSensors([]);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching sensors for areaId:", areaId);
        const areaSensors = await getSensorsByAreaId(areaId);
        console.log("Fetched sensors:", areaSensors);
        setSensors(areaSensors || []);
      } catch (err) {
        console.error("Error fetching sensors:", err);
        setError(err.message);
        setSensors([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSensors();
  }, [areaId]);
  return { sensors, loading, error };
}
