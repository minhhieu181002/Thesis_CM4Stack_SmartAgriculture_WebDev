import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  Thermometer,
  Droplets,
  Leaf,
  ArrowDownCircle,
  ArrowUpCircle,
  FlaskConical,
} from "lucide-react";
import { useAreaSensor } from "@/hooks/useAreaSensor";
import { useThresholds } from "@/hooks/useThresholds";
import { saveThresholdForSensor } from "@/services/firestore-services";
const sensorIcons = {
  temperature: Thermometer,
  humidity: Droplets,
  soil: Leaf,
};
// Mock sensors and devices for display purposes
const mockSensors = [
  {
    id: "temp1",
    type: "Temperature",
    unit: "°C",
    icon: Thermometer,
    currentAvg: 24.5,
  },
  {
    id: "hum1",
    type: "Humidity",
    unit: "%",
    icon: Droplets,
    currentAvg: 65,
  },
  {
    id: "soil1",
    type: "Soil Nutrients",
    unit: "ppm",
    icon: Leaf,
    currentAvg: { kali: 45, nito: 30, phospho: 25 },
  },
];

// Mock devices that can be controlled
const mockDevices = [
  { id: "pump1", name: "Water Pump", type: "pump" },
  { id: "fan1", name: "Cooling Fan", type: "fan" },
  { id: "light1", name: "LED Lights", type: "light" },
  { id: "valve1", name: "Nutrient Valve", type: "valve" },
];

function ThresholdSettingsDialog({ open, onOpenChange, currentAreaId }) {
  const {
    sensors,
    loading: sensorsLoading,
    error: sensorsError,
  } = useAreaSensor(currentAreaId);

  const {
    thresholds,
    loading: thresholdsLoading,
    error: thresholdsError,
  } = useThresholds(sensorsLoading ? [] : sensors, sensorsLoading);
  console.log("thresholds object is:", thresholds);
  const [sensorSettings, setSensorSettings] = useState([]);
  const [saving, setSaving] = useState(false);
  const transformSensors = (sensors) => {
    return sensors.map((sensor) => {
      const type = sensor.type;
      const icon = sensorIcons[type.toLowerCase()];

      // format return
      return {
        id: sensor.id,
        type: type,
        name: processSensorType(type || ""),
        unit: sensor.unit || getUnitForSensorType(type),
        icon: icon,
        currentValue: sensor.value || 0,
        isSoilNutrient: type.toLowerCase() === "soil",
      };
    });
  };
  useEffect(() => {
    if (sensors && sensors.length > 0) {
      const transformedSensors = transformSensors(sensors);

      // Initialize settings with values from thresholds if available
      setSensorSettings(
        transformedSensors.map((sensor) => {
          const threshold = thresholds[sensor.id];

          // Default empty values
          const defaultSettings = {
            sensorId: sensor.id,
            min: "",
            max: "",
            kali: { min: "", max: "" },
            nito: { min: "", max: "" },
            phospho: { min: "", max: "" },
            automations: [
              {
                enabled: true,
                condition: "above",
                threshold: "max",
                deviceId: "",
                action: "on",
                value: "",
              },
            ],
          };

          // If threshold data exists, update the settings
          if (threshold) {
            // Handle different sensor types
            if (
              sensor.type.toLowerCase() === "temperature" ||
              sensor.type.toLowerCase() === "humid"
            ) {
              defaultSettings.min = threshold.minThreshold?.toString() || "";
              defaultSettings.max = threshold.maxThreshold?.toString() || "";
            } else if (sensor.type.toLowerCase() === "soil") {
              // Handle soil nutrients thresholds
              defaultSettings.kali.min =
                threshold.minThresholdKali?.toString() || "";
              defaultSettings.kali.max =
                threshold.maxThresholdKali?.toString() || "";
              defaultSettings.nito.min =
                threshold.minThresholdNito?.toString() || "";
              defaultSettings.nito.max =
                threshold.maxThresholdNito?.toString() || "";
              defaultSettings.phospho.min =
                threshold.minThresholdPhospho?.toString() || "";
              defaultSettings.phospho.max =
                threshold.maxThresholdPhospho?.toString() || "";
            }
          }
          console.log("defaultSettings", defaultSettings);
          return defaultSettings;
        })
      );
    }
  }, [sensors, thresholds]);
  // Helper to get appropriate unit for sensor type
  const getUnitForSensorType = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("temp")) return "°C";
    if (lowerType.includes("humid")) return "%";
    if (lowerType.includes("soil")) return "ppm";
    return "";
  };

  // Helper to determine sensor type from name
  const processSensorType = (type) => {
    const name = type.toLowerCase();
    if (name.includes("temp")) return "Temperature";
    if (name.includes("humid")) return "Humidity";
    if (name.includes("soil")) return "Soil Nutrients";
    return "Sensor";
  };
  // Add a new automation rule - fixed to prevent duplicate additions
  const addAutomation = (sensorIndex) => {
    setSensorSettings((prevSettings) => {
      const newSettings = [...prevSettings];
      // Create a single new automation object
      const newAutomation = {
        enabled: true,
        condition: "above",
        threshold: "max",
        deviceId: "",
        action: "on",
        value: "",
      };
      // Add just one automation to the array
      newSettings[sensorIndex].automations.push(newAutomation);
      return newSettings;
    });
  };

  // // Remove an automation rule
  // const removeAutomation = (sensorIndex, automationIndex) => {
  //   setSensorSettings((prevSettings) => {
  //     const newSettings = [...prevSettings];
  //     newSettings[sensorIndex].automations = newSettings[
  //       sensorIndex
  //     ].automations.filter((_, i) => i !== automationIndex);
  //     return newSettings;
  //   });
  // };

  // // Update automation settings
  // const updateAutomation = (sensorIndex, automationIndex, field, value) => {
  //   setSensorSettings((prevSettings) => {
  //     const newSettings = [...prevSettings];
  //     newSettings[sensorIndex].automations[automationIndex][field] = value;
  //     return newSettings;
  //   });
  // };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const savePromises = [];
      sensorSettings.forEach((setting) => {
        if (!setting || !setting.sensorId) return;
        const sensorType = transformedSensors
          .find((s) => s.id === setting.sensorId)
          ?.type?.toLowerCase();
        if (!sensorType) {
          console.warn(
            `Could not determine sensor type for sensor ID: ${setting.sensorId}`
          );
          return;
        }
        let thresholdData = {};
        if (sensorType === "temperature" || sensorType === "humid") {
          thresholdData = {
            minThreshold: setting.min !== "" ? Number(setting.min) : null,
            maxThreshold: setting.max !== "" ? Number(setting.max) : null,
          };
        } else if (sensorType === "soil") {
          thresholdData = {
            minThresholdKali:
              setting.kali?.min !== "" ? Number(setting.kali.min) : null,
            maxThresholdKali:
              setting.kali?.max !== "" ? Number(setting.kali.max) : null,
            minThresholdNito:
              setting.nito?.min !== "" ? Number(setting.nito.min) : null,
            maxThresholdNito:
              setting.nito?.max !== "" ? Number(setting.nito.max) : null,
            minThresholdPhospho:
              setting.phospho?.min !== "" ? Number(setting.phospho.min) : null,
            maxThresholdPhospho:
              setting.phospho?.max !== "" ? Number(setting.phospho.max) : null,
          };
        }
        savePromises.push(
          saveThresholdForSensor(setting.sensorId, thresholdData)
        );
      });
      const results = await Promise.all(savePromises);
      const allSuccessful = results.every((result) => result === true);
      if (allSuccessful) {
        toast.success("All threshold settings saved successfully");
      } else {
        toast.error("Some threshold settings could not be saved");
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save threshold settings");
    } finally {
      setSaving(false);
    }
  };
  const transformedSensors = sensors ? transformSensors(sensors) : [];
  const loading = sensorsLoading || thresholdsLoading;
  const error = sensorsError || thresholdsError;
  console.log(transformedSensors);
  console.log(sensorSettings);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Threshold & Automation Settings</DialogTitle>
          <DialogDescription>
            Configure thresholds and automate actions when values cross set
            limits.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="ml-2">Loading sensors and thresholds...</span>
          </div>
        ) : error ? (
          <div className="text-red-500 py-4 text-center">
            Error loading sensors: {error}
          </div>
        ) : transformedSensors.length === 0 ? (
          <div className="text-center py-6">
            No sensors found for this area. Please add sensors first.
          </div>
        ) : (
          <Tabs defaultValue="thresholds" className="mt-2">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
            </TabsList>

            {/* Thresholds Tab */}
            <TabsContent value="thresholds" className="space-y-4">
              <div className="max-h-[60vh] overflow-y-auto p-1 pr-4 space-y-6">
                {transformedSensors.map((sensor, sensorIndex) => (
                  <div
                    key={sensor.id}
                    className="border p-4 rounded-lg bg-background shadow-sm"
                  >
                    <div className="flex items-center mb-3">
                      {sensor.icon && (
                        <sensor.icon className="h-5 w-5 mr-2 text-muted-foreground" />
                      )}
                      <h3 className="text-lg font-medium">{sensor.name}</h3>
                    </div>

                    {/* Current reading display */}
                    {sensor.currentAvg !== undefined &&
                      typeof sensor.currentAvg !== "object" && (
                        <div className="mb-4 flex items-center text-sm text-muted-foreground">
                          Current:{" "}
                          <span className="font-medium ml-1">
                            {sensor.currentValue} {sensor.unit}
                          </span>
                        </div>
                      )}

                    {/* Soil nutrient display */}
                    {/* {sensor.name === "Soil Nutrients" && (
                      <div className="mb-4 grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div>
                          K:{" "}
                          <span className="font-medium">
                            {sensor.currentValue.kali} {sensor.unit}
                          </span>
                        </div>
                        <div>
                          N:{" "}
                          <span className="font-medium">
                            {sensor.currentValue.nito} {sensor.unit}
                          </span>
                        </div>
                        <div>
                          P:{" "}
                          <span className="font-medium">
                            {sensor.currentValue.phospho} {sensor.unit}
                          </span>
                        </div>
                      </div>
                    )} */}

                    {/* Regular sensor inputs */}
                    {sensor.name !== "Soil Nutrients" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div className="space-y-1">
                          <Label htmlFor={`${sensor.id}-min`}>
                            Min ({sensor.unit})
                          </Label>
                          <Input
                            id={`${sensor.id}-min`}
                            type="number"
                            step="any"
                            placeholder="Enter minimum value"
                            value={sensorSettings[sensorIndex]?.min}
                            onChange={(e) => {
                              setSensorSettings((prev) => {
                                const newSettings = [...prev];
                                newSettings[sensorIndex].min = e.target.value;
                                return newSettings;
                              });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`${sensor.id}-max`}>
                            Max ({sensor.unit})
                          </Label>
                          <Input
                            id={`${sensor.id}-max`}
                            type="number"
                            step="any"
                            placeholder="Enter maximum value"
                            value={sensorSettings[sensorIndex]?.max}
                            onChange={(e) => {
                              setSensorSettings((prev) => {
                                const newSettings = [...prev];
                                newSettings[sensorIndex].max = e.target.value;
                                return newSettings;
                              });
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Soil nutrient inputs */}
                    {sensor.type === "soil" && (
                      <div className="space-y-4 mt-2 pl-2 border-l-2">
                        {/* Potassium (K) */}
                        <div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                            <div className="space-y-1">
                              <Label htmlFor={`${sensor.id}-kali-min`}>
                                Min ({sensor.unit})
                              </Label>
                              <Input
                                id={`${sensor.id}-kali-min`}
                                type="number"
                                step="any"
                                placeholder="Min potassium"
                                value={
                                  sensorSettings[sensorIndex]?.kali?.min || ""
                                }
                                onChange={(e) => {
                                  setSensorSettings((prev) => {
                                    const newSettings = [...prev];
                                    if (!newSettings[sensorIndex]) {
                                      newSettings[sensorIndex] = {
                                        min: "",
                                        max: "",
                                        kali: { min: "", max: "" },
                                        nito: { min: "", max: "" },
                                        phospho: { min: "", max: "" },
                                        automations: [],
                                      };
                                    }
                                    if (!newSettings[sensorIndex].kali) {
                                      newSettings[sensorIndex].kali = {
                                        min: "",
                                        max: "",
                                      };
                                    }
                                    newSettings[sensorIndex].kali.min =
                                      e.target.value;
                                    return newSettings;
                                  });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`${sensor.id}-kali-max`}>
                                Max ({sensor.unit})
                              </Label>
                              <Input
                                id={`${sensor.id}-kali-max`}
                                type="number"
                                step="any"
                                placeholder="Max potassium"
                                value={sensorSettings[sensorIndex]?.kali?.max}
                                onChange={(e) => {
                                  setSensorSettings((prev) => {
                                    const newSettings = [...prev];
                                    if (!newSettings[sensorIndex]) {
                                      newSettings[sensorIndex] = {
                                        min: "",
                                        max: "",
                                        kali: { min: "", max: "" },
                                        nito: { min: "", max: "" },
                                        phospho: { min: "", max: "" },
                                        automations: [],
                                      };
                                    }
                                    if (!newSettings[sensorIndex].kali) {
                                      newSettings[sensorIndex].kali = {
                                        min: "",
                                        max: "",
                                      };
                                    }
                                    newSettings[sensorIndex].kali.max =
                                      e.target.value;
                                    return newSettings;
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Nitrogen (N) */}
                        <div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                            <div className="space-y-1">
                              <Label htmlFor={`${sensor.id}-nito-min`}>
                                Min ({sensor.unit})
                              </Label>
                              <Input
                                id={`${sensor.id}-nito-min`}
                                type="number"
                                step="any"
                                placeholder="Min nitrogen"
                                value={sensorSettings[sensorIndex]?.nito?.min}
                                onChange={(e) => {
                                  setSensorSettings((prev) => {
                                    const newSettings = [...prev];
                                    if (!newSettings[sensorIndex]) {
                                      newSettings[sensorIndex] = {
                                        min: "",
                                        max: "",
                                        kali: { min: "", max: "" },
                                        nito: { min: "", max: "" },
                                        phospho: { min: "", max: "" },
                                        automations: [],
                                      };
                                    }
                                    if (!newSettings[sensorIndex].nito) {
                                      newSettings[sensorIndex].nito = {
                                        min: "",
                                        max: "",
                                      };
                                    }
                                    newSettings[sensorIndex].nito.min =
                                      e.target.value;
                                    return newSettings;
                                  });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`${sensor.id}-nito-max`}>
                                Max ({sensor.unit})
                              </Label>
                              <Input
                                id={`${sensor.id}-nito-max`}
                                type="number"
                                step="any"
                                placeholder="Max nitrogen"
                                value={sensorSettings[sensorIndex]?.nito?.max}
                                onChange={(e) => {
                                  setSensorSettings((prev) => {
                                    const newSettings = [...prev];
                                    if (!newSettings[sensorIndex]) {
                                      newSettings[sensorIndex] = {
                                        min: "",
                                        max: "",
                                        kali: { min: "", max: "" },
                                        nito: { min: "", max: "" },
                                        phospho: { min: "", max: "" },
                                        automations: [],
                                      };
                                    }
                                    if (!newSettings[sensorIndex].nito) {
                                      newSettings[sensorIndex].nito = {
                                        min: "",
                                        max: "",
                                      };
                                    }
                                    newSettings[sensorIndex].nito.max =
                                      e.target.value;
                                    return newSettings;
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Phosphorus (P) */}
                        <div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                            <div className="space-y-1">
                              <Label htmlFor={`${sensor.id}-phospho-min`}>
                                Min ({sensor.unit})
                              </Label>
                              <Input
                                id={`${sensor.id}-phospho-min`}
                                type="number"
                                step="any"
                                placeholder="Min phosphorus"
                                value={
                                  sensorSettings[sensorIndex]?.phospho?.min
                                }
                                onChange={(e) => {
                                  setSensorSettings((prev) => {
                                    const newSettings = [...prev];
                                    if (!newSettings[sensorIndex]) {
                                      newSettings[sensorIndex] = {
                                        min: "",
                                        max: "",
                                        kali: { min: "", max: "" },
                                        nito: { min: "", max: "" },
                                        phospho: { min: "", max: "" },
                                        automations: [],
                                      };
                                    }
                                    if (!newSettings[sensorIndex].phospho) {
                                      newSettings[sensorIndex].phospho = {
                                        min: "",
                                        max: "",
                                      };
                                    }
                                    newSettings[sensorIndex].phospho.min =
                                      e.target.value;
                                    return newSettings;
                                  });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`${sensor.id}-phospho-max`}>
                                Max ({sensor.unit})
                              </Label>
                              <Input
                                id={`${sensor.id}-phospho-max`}
                                type="number"
                                step="any"
                                placeholder="Max phosphorus"
                                value={
                                  sensorSettings[sensorIndex]?.phospho?.max
                                }
                                onChange={(e) => {
                                  setSensorSettings((prev) => {
                                    const newSettings = [...prev];
                                    if (!newSettings[sensorIndex]) {
                                      newSettings[sensorIndex] = {
                                        min: "",
                                        max: "",
                                        kali: { min: "", max: "" },
                                        nito: { min: "", max: "" },
                                        phospho: { min: "", max: "" },
                                        automations: [],
                                      };
                                    }
                                    if (!newSettings[sensorIndex].phospho) {
                                      newSettings[sensorIndex].phospho = {
                                        min: "",
                                        max: "",
                                      };
                                    }
                                    newSettings[sensorIndex].phospho.max =
                                      e.target.value;
                                    return newSettings;
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Automation Tab */}
            <TabsContent value="automation" className="space-y-4">
              <div className="max-h-[60vh] overflow-y-auto p-1 pr-4 space-y-6">
                {mockSensors.map((sensor, sensorIndex) => (
                  <div
                    key={sensor.id}
                    className="border p-4 rounded-lg bg-background shadow-sm"
                  >
                    <div className="flex items-center mb-3">
                      {sensor.icon && (
                        <sensor.icon className="h-5 w-5 mr-2 text-muted-foreground" />
                      )}
                      <h3 className="text-lg font-medium">
                        {sensor.type} Automation
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* {sensorSettings[sensorIndex].automations.map(
                        (automation, automationIndex) => (
                          <div
                            key={`${sensor.id}-automation-${automationIndex}`}
                            className="p-3 border rounded-md bg-gray-50"
                          >
                            <div className="grid grid-cols-1 gap-3">
                              <div className="flex items-center">
                                <span className="text-sm font-medium mr-2">
                                  When {sensor.type} is:
                                </span>
                                <div className="flex space-x-2 flex-1">
                                  <Select
                                    value={automation.condition}
                                    onValueChange={(value) => {
                                      updateAutomation(
                                        sensorIndex,
                                        automationIndex,
                                        "condition",
                                        value
                                      );
                                    }}
                                  >
                                    <SelectTrigger className="w-[110px]">
                                      <SelectValue placeholder="Condition" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="above">
                                        <div className="flex items-center">
                                          <ArrowUpCircle className="h-4 w-4 mr-1" />
                                          Above
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="below">
                                        <div className="flex items-center">
                                          <ArrowDownCircle className="h-4 w-4 mr-1" />
                                          Below
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <Select
                                    value={automation.threshold}
                                    onValueChange={(value) => {
                                      updateAutomation(
                                        sensorIndex,
                                        automationIndex,
                                        "threshold",
                                        value
                                      );
                                    }}
                                  >
                                    <SelectTrigger className="w-[110px]">
                                      <SelectValue placeholder="Threshold" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="max">
                                        Maximum
                                      </SelectItem>
                                      <SelectItem value="min">
                                        Minimum
                                      </SelectItem>
                                      <SelectItem value="custom">
                                        Custom
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>

                                  {automation.threshold === "custom" && (
                                    <Input
                                      type="number"
                                      placeholder={`Value in ${sensor.unit}`}
                                      className="w-[100px]"
                                      value={automation.value}
                                      onChange={(e) => {
                                        updateAutomation(
                                          sensorIndex,
                                          automationIndex,
                                          "value",
                                          e.target.value
                                        );
                                      }}
                                    />
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center">
                                <span className="text-sm font-medium mr-2">
                                  Then:
                                </span>
                                <div className="flex space-x-2 flex-1">
                                  <Select
                                    value={automation.deviceId}
                                    onValueChange={(value) => {
                                      updateAutomation(
                                        sensorIndex,
                                        automationIndex,
                                        "deviceId",
                                        value
                                      );
                                    }}
                                  >
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue placeholder="Select device" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {mockDevices.map((device) => (
                                        <SelectItem
                                          key={device.id}
                                          value={device.id}
                                        >
                                          {device.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  <Select
                                    value={automation.action}
                                    onValueChange={(value) => {
                                      updateAutomation(
                                        sensorIndex,
                                        automationIndex,
                                        "action",
                                        value
                                      );
                                    }}
                                  >
                                    <SelectTrigger className="w-[110px]">
                                      <SelectValue placeholder="Action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="on">
                                        Turn ON
                                      </SelectItem>
                                      <SelectItem value="off">
                                        Turn OFF
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {automationIndex > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() =>
                                      removeAutomation(
                                        sensorIndex,
                                        automationIndex
                                      )
                                    }
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )} */}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => addAutomation(sensorIndex)}
                      >
                        + Add Another Rule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} disabled={saving}>
            {saving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ThresholdSettingsDialog;
