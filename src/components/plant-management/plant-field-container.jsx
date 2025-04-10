import { TitleSection } from "./title-section";
import { CategoryTabContainer } from "./category-tab-container";
import { PlantFieldGrid } from "./plant-field-grid";

export function PlantFieldContainer({ plantIds = [] }) {
  return (
    <div className="mt-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/*left column 2/3 width of screen */}
        <div className="w-full lg:1 space-y-4">
          <TitleSection />
          <CategoryTabContainer />
          <PlantFieldGrid plantIds={plantIds} />
        </div>
      </div>
    </div>
  );
}
