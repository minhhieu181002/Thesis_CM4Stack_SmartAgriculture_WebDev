import { PlantFieldCard } from "./PlantFieldCard";
import { Sprout, Cherry, Apple, Salad, Wheat, Palmtree } from "lucide-react";

const iconClasses = "h-6 w-6";

export function PlantFieldGrid() {
  // Mock data for plant fields
  const plantFields = [
    {
      id: 1,
      plantName: "Tomato",
      lastUpdated: "2 days ago",
      icon: <Cherry className={`${iconClasses} text-red-500`} />,
      status: "Growing",
    },
    {
      id: 2,
      plantName: "Lettuce",
      lastUpdated: "5 days ago",
      icon: <Salad className={`${iconClasses} text-green-500`} />,
      status: "Ready for Harvest",
    },
    {
      id: 3,
      plantName: "Basil",
      lastUpdated: "1 day ago",
      icon: <Sprout className={`${iconClasses} text-green-600`} />,
      status: "Growing",
    },
    {
      id: 4,
      plantName: "Apple Tree",
      lastUpdated: "1 week ago",
      icon: <Apple className={`${iconClasses} text-red-600`} />,
      status: "Needs Attention",
    },
    {
      id: 5,
      plantName: "Rice",
      lastUpdated: "3 days ago",
      icon: <Wheat className={`${iconClasses} text-amber-600`} />,
      status: "Growing",
    },
    {
      id: 6,
      plantName: "Palm",
      lastUpdated: "2 weeks ago",
      icon: <Palmtree className={`${iconClasses} text-green-700`} />,
      status: "Harvested",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {plantFields.map((field) => (
        <PlantFieldCard
          key={field.id}
          plantName={field.plantName}
          lastUpdated={field.lastUpdated}
          icon={field.icon}
          status={field.status}
        />
      ))}
    </div>
  );
}
