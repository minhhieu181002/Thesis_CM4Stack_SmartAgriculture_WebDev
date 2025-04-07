import React, { useState, useMemo, useCallback } from "react";
import { Droplets } from "lucide-react";

// Import all irrigation components
import { ScheduleModal } from "../components/irrigation/ScheduleModal";
import { AreaView } from "../components/irrigation/AreaView";
import { PumpOverviewTable } from "../components/irrigation/PumpOverviewTable";
import { IrrigationTabs } from "../components/irrigation/IrrigationTabs";

// Initial pump data for the application
const INITIAL_PUMP_DATA = {
  "FY-A1": {
    id: "FY-A1",
    name: "Pump FY-A1 (Lawn Sprinklers)",
    area: "Front Yard",
    mode: "Manual",
    manualState: false,
    schedule: null,
  },
  "FY-B1": {
    id: "FY-B1",
    name: "Pump FY-B1 (Flower Beds)",
    area: "Front Yard",
    mode: "Auto",
    manualState: false,
    schedule: { start: "07:00", end: "07:10" },
  },
  "VG-A1": {
    id: "VG-A1",
    name: "Pump VG-A1 (Drip System)",
    area: "Vegetable Garden",
    mode: "Manual",
    manualState: false,
    schedule: null,
  },
  "BY-A1": {
    id: "BY-A1",
    name: "Pump BY-A1 (Patio Misters)",
    area: "Backyard",
    mode: "Manual",
    manualState: false,
    schedule: null,
  },
};

function Irrigation() {
  // State for pump data
  const [pumpData, setPumpData] = useState(INITIAL_PUMP_DATA);
  // State for active tab
  const [activeTab, setActiveTab] = useState("Front Yard"); // Default to first area
  // State for schedule modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pumpToEdit, setPumpToEdit] = useState(null);

  // Memoize pump list and area names
  const pumps = useMemo(() => Object.values(pumpData), [pumpData]);
  const areaNames = useMemo(
    () => [...new Set(pumps.map((p) => p.area))],
    [pumps]
  );

  // Handler to update pump state
  const handleUpdatePump = useCallback((pumpId, updates) => {
    setPumpData((prevData) => {
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
      setPumpToEdit(pumpData[pumpId]);
      setIsModalOpen(true);
    },
    [pumpData]
  );

  // Handler to close the schedule modal
  const handleCloseScheduleModal = useCallback(() => {
    setIsModalOpen(false);
    setPumpToEdit(null);
  }, []);

  // Create the content for overview tab
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

export default Irrigation;
