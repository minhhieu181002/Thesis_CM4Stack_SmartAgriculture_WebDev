import { AddAreaButton } from "./area-button";
import { AreaContainer } from "./area-container";
import { PlantFieldContainer } from "./plant-field-container";
export function PlantManagementContainer() {
  // Example data - would be fetched from an API in a real application
  const mockAreas = [
    {
      id: 1,
      title: "Greenhouse A",
      fields: 4,
      devices: 5,
      sensors: 6,
    },
    {
      id: 2,
      title: "Outdoor Garden",
      fields: 2,
      devices: 3,
      sensors: 8,
    },
    {
      id: 3,
      title: "Vertical Farm",
      fields: 6,
      devices: 7,
      sensors: 12,
    },
    {
      id: 4,
      title: "Hydroponic System",
      fields: 3,
      devices: 4,
      sensors: 9,
    },
    // {
    //   id: 5,
    //   title: "Test Area",
    //   fields: 1,
    //   devices: 2,
    //   sensors: 3,
    // },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Plant Management</h1>
        <AddAreaButton />
      </div>
      <AreaContainer areas={mockAreas} />
      <PlantFieldContainer />
    </div>
  );
}
