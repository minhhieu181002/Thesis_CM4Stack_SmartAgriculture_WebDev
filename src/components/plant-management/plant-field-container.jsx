import { TitleSection } from "./title-section";
import { CategoryTabContainer } from "./category-tab-container";
import { PlantFieldGrid } from "./plant-field-grid";

export function PlantFieldContainer({
  activeArea,
  allAreas = [],
  plantIds = [],
  onPlantAdded,
  onPlantDeleted,
}) {
  return (
    <div className="mt-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/*left column 2/3 width of screen */}
        <div className="w-full lg:1 space-y-4">
          <TitleSection
            activeArea={activeArea}
            allAreas={allAreas}
            onPlantAdded={onPlantAdded}
          />
          <CategoryTabContainer />
          <PlantFieldGrid plantIds={plantIds} onPlantDeleted={onPlantDeleted} />
        </div>
      </div>
    </div>
  );
}
