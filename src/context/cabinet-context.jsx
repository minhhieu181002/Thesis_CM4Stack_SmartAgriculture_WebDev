import { createContext, useContext, useState, useEffect } from "react";
import { UserAuth } from "@/context/auth-context";
import {
  getCabinetsByContainerIds,
  getAreasByCabinetId,
  getOutputDevicesByContainerId,
} from "@/services/firestoreServices";

// create context
const CabinetContext = createContext();
export function CabinetProvider({ children }) {
  const { userProfile } = UserAuth();
  const [cabinets, setCabinets] = useState([]);
  const [firstCabinet, setFirstCabinet] = useState(null);
  const [areas, setAreas] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);
  const [stats, setStats] = useState({
    numOfArea: 0,
    numOfDevice: 0,
    numOfPlant: 0,
    numOfSensor: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCabinetData() {
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
        const cabinetArray = Array.isArray(userCabinets) ? userCabinets : [];
        setCabinets(cabinetArray);

        // get data from the first cabinet
        if (cabinetArray.length > 0) {
          const first = cabinetArray[0];
          setFirstCabinet(first);

          // calculate stats
          calculateStats(cabinetArray);

          // Fetch areas and devices for the first cabinet
          const cabinetAreas = await getAreasByCabinetId(first.id);
          setAreas(cabinetAreas || []);
          console.log("Cabinet Areas:", cabinetAreas);

          const outputDevices = await getOutputDevicesByContainerId(first.id);
          setOutputDevices(outputDevices || []);
          console.log("Cabinet Devices:", outputDevices);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cabinet data:", error);
        setError(error.message);
        setLoading(false);
      }
    }
    fetchCabinetData();
  }, [userProfile]);

  const calculateStats = (cabinetArray) => {
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
  };

  return (
    <CabinetContext.Provider
      value={{
        cabinets,
        firstCabinet,
        areas,
        outputDevices,
        stats,
        loading,
        error,
      }}
    >
      {children}
    </CabinetContext.Provider>
  );
}
// Custom hook to use cabinet context
export function useCabinetContext() {
  const context = useContext(CabinetContext);
  if (!context) {
    throw new Error("useCabinetContext must be used within a CabinetProvider");
  }
  return context;
}
