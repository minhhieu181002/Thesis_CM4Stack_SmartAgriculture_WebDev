import React, { useEffect } from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Thermometer, Droplets, Leaf, Gauge } from "lucide-react";
// import { useRealtimeSensor } from "@/hooks/useRealtimeSensor";
import { useUserCabinetStats } from "@/hooks/useUserCabinetStats";
import { useAreaSensor } from "@/hooks/useAreaSensor";
import { RealTimeSensorCard } from "./real-time-sensor-card";
/**
 * Status indicator component showing a colored dot and status text
 */
function ActiveIndicator({ status }) {
  // Define color based on status
  const isActive = status.toLowerCase() === "active";

  return (
    <div className="flex items-center gap-2">
      {/* Colored dot indicator */}
      <div
        className={cn(
          "w-2.5 h-2.5 rounded-full",
          isActive ? "bg-green-500" : "bg-red-500"
        )}
      />

      {/* Status text */}
      <span
        className={cn(
          "text-sm font-medium",
          isActive ? "text-green-600" : "text-red-600"
        )}
      ></span>
    </div>
  );
}
function StatusIndicator({ status }) {
  const isNormal = status.toLowerCase() === "normal";

  return (
    <div className="flex items-center gap-2">
      <div className={cn(isNormal ? "bg-green-500" : "bg-red-500")} />
      <span className={cn(isNormal ? "text-green-600" : "text-red-600")}>
        {status}
      </span>
    </div>
  );
}
/**
 * Generic Sensor Card component for dynamic rendering
 */
export function SensorCard({ sensor }) {
  // Process sensor type
  const type = typeof sensor === "string" ? sensor : sensor.type || "default";
  console.log("Sensor Type:", type);
  // Configure card based on sensor type
  const cardConfig = {
    temperature: {
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-100",
      icon: <Thermometer className="h-12 w-12" />,
      title: "Air Temp",
      format: (value) => `${value}°C`,
    },
    humid: {
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      icon: <Droplets className="h-12 w-12" />,
      title: "Humidity",
      format: (value) => `${value}%`,
    },
    soil: {
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
      icon: <Leaf className="h-12 w-12" />,
      title: "Soil",
      // No format function for soil as it has custom rendering
    },
    // Add more sensor types as needed
    default: {
      bgColor: "bg-gray-50",
      borderColor: "border-gray-100",
      icon: <Gauge className="h-12 w-12" />,
      title: typeof sensor === "object" ? sensor.name || "Sensor" : "Sensor",
      format: (value) =>
        `${value} ${typeof sensor === "object" ? sensor.unit || "" : ""}`,
    },
  };

  const config = cardConfig[type] || cardConfig.default;

  return (
    <Card className={`${config.bgColor} ${config.borderColor}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {config.icon}
          <h3 className="font-medium text-lg">
            {typeof sensor === "object"
              ? sensor.name || config.title
              : config.title}
          </h3>
        </div>
        <ActiveIndicator
          status={
            typeof sensor === "object" ? sensor.status || "active" : "active"
          }
        />
      </CardHeader>
      <CardContent>
        {/* Special rendering for soil type sensors */}
        {type === "soil" ? (
          <div className="space-y-0.5">
            <div className="flex items-center">
              <div className="w-20">
                <div className="font-semibold text-gray-600">Nito</div>
              </div>
              <div className="text-2xl font-bold">
                {typeof sensor === "object" && sensor.nutrients
                  ? `${sensor.nutrients.nito || 0} PPM`
                  : "10 PPM"}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-20">
                <div className="font-semibold text-gray-600">Kali</div>
              </div>
              <div className="text-2xl font-bold">
                {typeof sensor === "object" && sensor.nutrients
                  ? `${sensor.nutrients.kali || 0} PPM`
                  : "15 PPM"}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20">
                  <div className="font-semibold text-gray-600">Phospho</div>
                </div>
                <div className="text-2xl font-bold">
                  {typeof sensor === "object" && sensor.nutrients
                    ? `${sensor.nutrients.phospho || 0} PPM`
                    : "9 PPM"}
                </div>
              </div>
              <div className="ml-4 italic">
                <StatusIndicator
                  status={
                    typeof sensor === "object"
                      ? sensor.status || "normal"
                      : "normal"
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          /* Standard rendering for other sensor types */
          <>
            <div className="text-4xl font-bold ml-1">
              {typeof sensor === "object" && config.format
                ? config.format(sensor.value || 0)
                : config.format
                ? config.format(0)
                : "0"}
            </div>
            <div className="mt-1.5 italic">
              <StatusIndicator
                status={
                  typeof sensor === "object"
                    ? sensor.status || "normal"
                    : "normal"
                }
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
/**
 * Air Temperature section component
 */
function AirTempSection() {
  return (
    <Card className="bg-yellow-50 border-yellow-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Thermometer className="h-12 w-12" />
          <h3 className="font-medium text-lg">Air Temp</h3>
        </div>
        <ActiveIndicator status="active" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold ml-1">40°C</div>
        <div className="mt-1.5 italic">
          <StatusIndicator status="Warning" />
        </div>
      </CardContent>
    </Card>
  );
}

// /**
//  * Humidity section component
//  */
function HumiditySection() {
  return (
    <Card className="bg-blue-50 border-blue-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Droplets className="h-12 w-12" />
          <h3 className="font-medium text-lg">Humidity</h3>
        </div>
        <ActiveIndicator status="active" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold mb ml-1">80%</div>
        <div className="mt-1.5 italic">
          <StatusIndicator status="normal" />
        </div>
      </CardContent>
    </Card>
  );
}

// /**
//  * Soil section component showing nutrient values
//  */
function SoilSection() {
  return (
    <Card className="bg-green-50 border-green-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Leaf className="h-12 w-12 " />
          <h3 className="font-medium text-lg">Soil</h3>
        </div>
        <ActiveIndicator status="inactive" />
      </CardHeader>
      <CardContent>
        {/* Nutrient values with left alignment */}
        <div className="space-y-0.5">
          <div className="flex items-center">
            <div className="w-20">
              <div className="font-semibold text-gray-600">Nito</div>
            </div>
            <div className="text-2xl font-bold">10 PPM</div>
          </div>

          <div className="flex items-center">
            <div className="w-20">
              <div className="font-semibold text-gray-600">Kali</div>
            </div>
            <div className="text-2xl font-bold">15 PPM</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20">
                <div className="font-semibold text-gray-600">Phospho</div>
              </div>
              <div className="text-2xl font-bold">9 PPM</div>
            </div>
            <div className="ml-4 italic">
              <StatusIndicator status="normal" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Area filter component using regular HTML select
 */
function AreaFilter({ areas = [], selectedAreaId, onAreaChange }) {
  return (
    <div className="flex items-center gap-3">
      <Label htmlFor="area-select" className="font-medium">
        Area:
      </Label>
      <select
        id="area-select"
        className="border rounded-md bg-background px-3 py-1.5"
        value={selectedAreaId || ""}
        onChange={(e) => onAreaChange(e.target.value)}
      >
        {areas.length === 0 && <option value=""> No areas available</option>}
        {areas.map((area) => (
          <option key={area.id} value={area.id}>
            {area.name}
          </option>
        ))}
      </select>
    </div>
  );
}
function processSensorType(sensorName) {
  if (!sensorName) return "default";

  const sensorName_lc = sensorName.toLowerCase();

  // Extract base sensor type using common prefixes
  if (sensorName_lc.includes("temp")) return "temperature";
  if (sensorName_lc.includes("humid")) return "humidity";
  if (sensorName_lc.includes("soil")) return "soil";
  // if (sensorName_lc.includes("moist")) return "humidity";
  // if (sensorName_lc.includes("light")) return "light";
  // if (sensorName_lc.includes("co2")) return "co2";
  // if (sensorName_lc.includes("ph")) return "ph";
  // if (sensorName_lc.includes("ec")) return "ec";

  // Default to the first part of the name if it contains numbers
  const match = sensorName_lc.match(/([a-z]+)\d+/);
  if (match && match[1]) {
    return match[1];
  }

  // If no pattern matches, return default
  return "default";
}
/**
 * Main Sensors component displaying Air Temp, Humidity, and Soil sections
 * in a two-column layout with an Area filter
 */
export function SensorsDisplay() {
  // const { sensorData, isLoading, error } = useRealtimeSensor();
  // if (isLoading) {
  //   return <div> Loading sensor for {sensorId}...</div>;
  // }
  // if (error) {
  //   return (
  //     <div style={{ color: "red" }}>
  //       Error loading sensor {sensorId}: {error.message}
  //     </div>
  //   );
  // }
  // if (!sensorData) {
  //   return <div>No sensor data available</div>;
  // }
  const { areas, loading: areasLoading } = useUserCabinetStats();
  const [selectedAreaId, setSelectedAreaId] = useState("");

  // set initial selected area if available
  useEffect(() => {
    if (areas?.length > 0 && !selectedAreaId) {
      setSelectedAreaId(areas[0].id);
    }
  }, [areas, selectedAreaId]);
  const {
    sensors: areaSensors,
    loading,
    error,
  } = useAreaSensor(selectedAreaId);
  // handle area change
  const handleAreaChange = (areaId) => {
    setSelectedAreaId(areaId);
  };

  // get selected area data
  const selectedArea = areas?.find((area) => area.id === selectedAreaId);

  // Show loading state
  if (areasLoading) {
    return <div className="p-4">Loading areas...</div>;
  }
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold">Sensors</h2>
        <AreaFilter
          areas={areas}
          selectedAreaId={selectedAreaId}
          onAreaChange={handleAreaChange}
        />
      </div>

      <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
        {/* Show loading indicator while fetching sensors */}
        {loading && <p>Loading sensors for {selectedArea?.name}...</p>}

        {/* Show error message if sensors couldn't be loaded */}
        {error && <p className="text-red-500">{error}</p>}

        {/* Show message if no sensors are available */}
        {!loading && !error && areaSensors.length === 0 && (
          <p className="text-gray-500">No sensors available for this area</p>
        )}

        {/* Dynamic grid of sensor cards */}
        {!loading && !error && areaSensors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {areaSensors.map((sensor) => {
              // Process sensor type for dynamic rendering
              const SensorType = processSensorType(sensor.id);
              console.log("Sensor Type:", SensorType);
              const cabinet = areas?.find(
                (area) => area.id === selectedAreaId
              )?.container;
              console.log("The cabinet is:", cabinet);
              return (
                <RealTimeSensorCard
                  key={sensor.id}
                  sensor={sensor}
                  containerId={cabinet}
                />
              );
            })}
          </div>
        )}

        {/* If no sensors are fetched yet, show default static examples */}
        {!loading && !error && areaSensors.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <AirTempSection />
            <HumiditySection />
            <SoilSection /> */}
            <p>Add the sensor to this area</p>
          </div>
        )}
      </div>
    </>
  );
}
