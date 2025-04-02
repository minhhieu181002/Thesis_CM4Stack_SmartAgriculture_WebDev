import { useState } from "react";
import { CategoryTabItem } from "./CategoryTabItem";

const categories = [
  "All",
  "Vegetable",
  "Fruit",
  "Herb",
  "Food Crop",
  "Industrial Tree",
];

export function CategoryTabContainer() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="border-b flex overflow-x-auto scrollbar-hide">
      {categories.map((category) => (
        <CategoryTabItem
          key={category}
          name={category}
          active={activeCategory === category}
          onClick={() => setActiveCategory(category)}
        />
      ))}
    </div>
  );
}
