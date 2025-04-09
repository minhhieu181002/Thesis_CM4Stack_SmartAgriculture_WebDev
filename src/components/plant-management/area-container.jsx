import { AreaCard } from "./area-card";

export function AreaContainer({ areas = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {areas.map((area) => (
        <AreaCard
          key={area.id}
          title={area.title}
          fields={area.fields}
          devices={area.devices}
          sensors={area.sensors}
        />
      ))}
    </div>
  );
}
