import { useState, useEffect } from "react";
import { UserAuth } from "@/context/auth-context";
import { getCabinetsByContainerIds } from "@/services/firestoreServices";
import { getAreasByCabinetId } from "@/services/firestoreServices";
export function useUserCabinetStats() {
  const { userProfile } = UserAuth();
  console.log("User in useUserCabinetStats:", userProfile);
  const [stats, setStats] = useState({
    numOfArea: 0,
    numOfDevice: 0,
    numOfPlant: 0,
    numOfSensor: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cabinets, setCabinets] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    async function fetchCabinetStats() {
      if (!userProfile) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        // Get cabinets using the user's container IDs
        const userCabinets = await getCabinetsByContainerIds(
          userProfile.containers
        );
        console.log("User Cabinets:", userCabinets);
        // Make sure userCabinets is an array
        const cabinetArray = Array.isArray(userCabinets) ? userCabinets : [];
        setCabinets(cabinetArray);

        // Only try to calculate stats if cabinets exist
        if (cabinetArray.length > 0) {
          const firstCabinet = cabinetArray[0];
          const cabinetAreas = await getAreasByCabinetId(firstCabinet.id);
          setAreas(cabinetAreas || []);
          console.log("Cabinet Areas:", cabinetAreas);
          // Sum up stats across all cabinets
          const totalAreaCount = cabinetArray.reduce(
            (sum, cabinet) => sum + (cabinet.areas?.length || 0),
            0
          );
          const totalDeviceCount = cabinetArray.reduce(
            (sum, cabinet) => sum + (cabinet.outputDevices?.length || 0),
            0
          );
          const totalPlantCount = cabinetArray.reduce(
            (sum, cabinet) => sum + (cabinet.plantIds?.length || 0),
            0
          );
          const totalSensorCount = cabinetArray.reduce(
            (sum, cabinet) => sum + (cabinet.sensors?.length || 0),
            0
          );
          setStats({
            numOfArea: totalAreaCount,
            numOfDevice: totalDeviceCount,
            numOfPlant: totalPlantCount,
            numOfSensor: totalSensorCount,
          });
          console.log(
            "Total Stats:",
            totalAreaCount,
            totalDeviceCount,
            totalPlantCount,
            totalSensorCount
          );
        } else {
          // Reset stats if no cabinets
          setStats({
            numOfArea: 0,
            numOfDevice: 0,
            numOfPlant: 0,
            numOfSensor: 0,
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching cabinet stats:", error);
        setError(error.message);
        setLoading(false);
      }
    }
    fetchCabinetStats();
  }, [userProfile]);

  return {
    stats,
    areas,
    loading,
    error,
    cabinets,
  };
}
