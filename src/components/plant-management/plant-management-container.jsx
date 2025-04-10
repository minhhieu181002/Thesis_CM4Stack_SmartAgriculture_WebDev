import { AddAreaButton } from "./area-button";
import { AreaContainer } from "./area-container";
import { PlantFieldContainer } from "./plant-field-container";
import { useCabinetContext } from "@/context/cabinet-context";
// import { Loader } from "@/components/ui/loader";
export function PlantManagementContainer() {
  // Example data - would be fetched from an API in a real application
  // const mockAreas = [
  //   {
  //     id: 1,
  //     title: "Greenhouse A",
  //     fields: 4,
  //     devices: 5,
  //     sensors: 6,
  //   },
  //   {
  //     id: 2,
  //     title: "Outdoor Garden",
  //     fields: 2,
  //     devices: 3,
  //     sensors: 8,
  //   },
  //   {
  //     id: 3,
  //     title: "Vertical Farm",
  //     fields: 6,
  //     devices: 7,
  //     sensors: 12,
  //   },
  //   {
  //     id: 4,
  //     title: "Hydroponic System",
  //     fields: 3,
  //     devices: 4,
  //     sensors: 9,
  //   },
  //   // {
  //   //   id: 5,
  //   //   title: "Test Area",
  //   //   fields: 1,
  //   //   devices: 2,
  //   //   sensors: 3,
  //   // },
  // ];
  const { areas } = useCabinetContext();
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
