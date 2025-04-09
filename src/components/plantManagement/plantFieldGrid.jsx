import { PlantFieldCard } from "./PlantFieldCard";
import { Sprout, Cherry, Apple, Salad, Wheat, Palmtree } from "lucide-react";

// Import images from assets
import tomatoImage from "../../assets/images/fruit.png";
// import lettuceImage from '../../assets/images/lettuce.jpg';
// import basilImage from '../../assets/images/basil.jpg';
// import appleImage from '../../assets/images/apple.jpg';
// import riceImage from '../../assets/images/rice.jpg';
// import palmImage from '../../assets/images/palm.jpg';

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
      image: tomatoImage,
    },
    {
      id: 2,
      plantName: "Lettuce",
      lastUpdated: "5 days ago",
      icon: <Salad className={`${iconClasses} text-green-500`} />,
      status: "Ready for Harvest",
      image: tomatoImage,
    },
    {
      id: 3,
      plantName: "Basil",
      lastUpdated: "1 day ago",
      icon: <Sprout className={`${iconClasses} text-green-600`} />,
      status: "Growing",
      image: tomatoImage,
    },
    {
      id: 4,
      plantName: "Apple Tree",
      lastUpdated: "1 week ago",
      icon: <Apple className={`${iconClasses} text-red-600`} />,
      status: "Attention",
      image: tomatoImage,
    },
    {
      id: 5,
      plantName: "Rice",
      lastUpdated: "3 days ago",
      icon: <Wheat className={`${iconClasses} text-amber-600`} />,
      status: "Growing",
      image: tomatoImage,
    },
    {
      id: 6,
      plantName: "Palm",
      lastUpdated: "2 weeks ago",
      icon: <Palmtree className={`${iconClasses} text-green-700`} />,
      status: "Harvested",
      image: tomatoImage,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
      {plantFields.map((field) => (
        <PlantFieldCard
          key={field.id}
          plantName={field.plantName}
          lastUpdated={field.lastUpdated}
          // icon={field.icon}
          status={field.status}
          image={field.image}
        />
      ))}
    </div>
  );
}
