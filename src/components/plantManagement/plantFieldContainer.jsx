import { TitleSection } from "./TitleSection";
import { CategoryTabContainer } from "./CategoryTabContainer";
import { PlantFieldGrid } from "./PlantFieldGrid";
import { ThresholdSettings } from "./ThresholdSettings";

export function PlantFieldContainer() {
  return (
    <div className="mt-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/*left column 2/3 width of screen */}
        <div className="w-full lg:w-2/3 space-y-4">
          <TitleSection />
          <CategoryTabContainer />
          <PlantFieldGrid />
        </div>
        {/*right column 1/3 width of screen */}
        <div className="w-full lg:w-1/3 mt-6 lg:mt-0">
          <ThresholdSettings />
        </div>
      </div>
    </div>
  );
}
