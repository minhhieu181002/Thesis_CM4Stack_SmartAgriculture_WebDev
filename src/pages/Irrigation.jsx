import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Droplets } from "lucide-react";
import { useIrrigationDevices } from "@/hooks/useIrrigationDevices";
// Import all irrigation components
import { ScheduleModal } from "../components/irrigation/ScheduleModal";
import { AreaView } from "../components/irrigation/AreaView";
import { PumpOverviewTable } from "../components/irrigation/PumpOverviewTable";
import { IrrigationTabs } from "../components/irrigation/IrrigationTabs";

// Initial pump data for the application
// const INITIAL_PUMP_DATA = {
//   "FY-A1": {
//     id: "FY-A1",
//     name: "Pump FY-A1 (Lawn Sprinklers)",
//     area: "Front Yard",
//     mode: "Manual",
//     manualState: false,
//     schedule: null,
//   },
//   "FY-B1": {
//     id: "FY-B1",
//     name: "Pump FY-B1 (Flower Beds)",
//     area: "Front Yard",
//     mode: "Auto",
//     manualState: false,
//     schedule: { start: "07:00", end: "07:10" },
//   },
//   "VG-A1": {
//     id: "VG-A1",
//     name: "Pump VG-A1 (Drip System)",
//     area: "Vegetable Garden",
//     mode: "Manual",
//     manualState: false,
//     schedule: null,
//   },
//   "BY-A1": {
//     id: "BY-A1",
//     name: "Pump BY-A1 (Patio Misters)",
//     area: "Backyard",
//     mode: "Manual",
//     manualState: false,
//     schedule: null,
//   },
// };
const FALLBACK_PUMP_DATA = {
  "demo-pump-1": {
    id: "demo-pump-1",
    name: "Demo Pump (No devices found)",
    area: "Demo Area",
    mode: "Manual",
    manualState: false,
    schedule: null,
  },
};
export default function Irrigation() {
  // Get data from hook
  const { pumpData, isLoading, error } = useIrrigationDevices();

  // Use real data if available, otherwise use fallback data
  const initialPumpData =
    Object.keys(pumpData).length > 0 ? pumpData : FALLBACK_PUMP_DATA;

  // All state hooks at the top
  const [managedPumpData, setManagedPumpData] = useState(initialPumpData);
  const [activeTab, setActiveTab] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pumpToEdit, setPumpToEdit] = useState(null);

  // All derived values with useMemo
  const pumps = useMemo(
    () => Object.values(managedPumpData),
    [managedPumpData]
  );
  const areaNames = useMemo(
    () => [...new Set(pumps.map((p) => p.area))],
    [pumps]
  );

  // All useEffect hooks
  useEffect(() => {
    if (Object.keys(pumpData).length > 0) {
      setManagedPumpData(pumpData);
    }
  }, [pumpData]);

  // useEffect(() => {
  //   if (areaNames.length > 0 && activeTab === "Overview") {
  //     setActiveTab(areaNames);
  //   }
  // }, [areaNames, activeTab]);

  // All callback hooks
  const handleUpdatePump = useCallback((pumpId, updates) => {
    setManagedPumpData((prevData) => {
      if (!prevData[pumpId]) return prevData;
      return {
        ...prevData,
        [pumpId]: { ...prevData[pumpId], ...updates },
      };
    });
    console.log(`Updating pump ${pumpId}:`, updates);
  }, []);

  // Handler for saving schedule from modal
  const handleSaveSchedule = useCallback(
    (pumpId, newSchedule) => {
      handleUpdatePump(pumpId, { schedule: newSchedule });
      setIsModalOpen(false);
      setPumpToEdit(null);
    },
    [handleUpdatePump]
  );

  // Handler to open the schedule modal
  const handleOpenScheduleModal = useCallback(
    (pumpId) => {
      setPumpToEdit(managedPumpData[pumpId]); // Changed from pumpData to managedPumpData
      setIsModalOpen(true);
    },
    [managedPumpData] // Changed dependency from pumpData to managedPumpData
  );

  // Handler to close the schedule modal
  const handleCloseScheduleModal = useCallback(() => {
    setIsModalOpen(false);
    setPumpToEdit(null);
  }, []);

  // Create tab contents (these aren't hooks so they can come after conditional logic)
  const overviewTabContent = <PumpOverviewTable pumps={pumps} />;

  // Create the content for area tabs
  const areaTabContents = areaNames.map((area) => (
    <AreaView
      key={area}
      areaName={area}
      pumpsInArea={pumps.filter((p) => p.area === area)}
      onUpdatePump={handleUpdatePump}
      onOpenScheduleModal={handleOpenScheduleModal}
    />
  ));

  // Now handle conditional rendering AFTER all hooks have been called
  if (isLoading) {
    return <div className="p-4">Loading irrigation devices...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  // Main component render
  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <Droplets className="mr-3 h-7 w-7 text-blue-500" />
        Irrigation Control
      </h1>

      {/* Tabs with Content */}
      <IrrigationTabs
        areaNames={areaNames}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        overviewContent={overviewTabContent}
        areaContents={areaTabContents}
      />

      {/* Schedule Editing Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={handleCloseScheduleModal}
        pumpToEdit={pumpToEdit}
        onSaveSchedule={handleSaveSchedule}
      />
    </div>
  );
}
