import { TitleSection } from "./TitleSection";
import { CategoryTabContainer } from "./CategoryTabContainer";
import { PlantFieldGrid } from "./PlantFieldGrid";

export function PlantFieldContainer() {
  return (
    <div className="space-y-4 mt-8">
      <TitleSection />
      <CategoryTabContainer />
      <PlantFieldGrid />
    </div>
  );
}
