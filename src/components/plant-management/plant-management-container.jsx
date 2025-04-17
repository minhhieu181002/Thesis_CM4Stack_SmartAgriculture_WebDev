import { AddAreaButton } from "./area-button";
import { AreaContainer } from "./area-container";
import { PlantFieldContainer } from "./plant-field-container";
import { useCabinetContext } from "@/context/cabinet-context";
// import { Loader } from "@/components/ui/loader";
export function PlantManagementContainer() {
  const { areas, loading, error } = useCabinetContext();
  const transformedAreas = areas.map((area) => ({
    id: area.id,
    title: area.name,
    fields: area.plantCount,
    devices: area.devices.length,
    sensors: area.sensors.length,
    plantIds: area.plantIds || [],
  }));
  console.log("Transformed Areas:", transformedAreas);
  return (
    <div className="space-y-8">
      <div className="flex justify-between justify-items-center items-center">
        <h1 className="text-2xl font-bold">Plant Management</h1>
        <AddAreaButton />
      </div>
      <AreaContainer areas={transformedAreas} />
    </div>
  );
}
