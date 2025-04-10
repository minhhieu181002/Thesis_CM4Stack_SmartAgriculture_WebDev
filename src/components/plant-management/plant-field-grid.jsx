import { useState, useEffect } from "react";
import { PlantFieldCard } from "./plant-field-card";
import { Sprout, Cherry, Apple, Salad, Wheat, Palmtree } from "lucide-react";
import { getPlantsByIds } from "@/services/firestore-services";
// import { Progress } from "@/components/ui/progress";

// Import images from assets
import defaultPlantImage from "../../assets/images/fruit.png";
// import lettuceImage from '../../assets/images/lettuce.jpg';
// import basilImage from '../../assets/images/basil.jpg';
// import appleImage from '../../assets/images/apple.jpg';
// import riceImage from '../../assets/images/rice.jpg';
// import palmImage from '../../assets/images/palm.jpg';

// Map plant categories to icons
// const categoryIcons = {
//   Vegetable: <Salad className="h-6 w-6 text-green-500" />,
//   Fruit: <Cherry className="h-6 w-6 text-red-500" />,
//   Herb: <Sprout className="h-6 w-6 text-green-600" />,
//   Tree: <Apple className="h-6 w-6 text-red-600" />,
//   Grain: <Wheat className="h-6 w-6 text-amber-600" />,
//   Decorative: <Palmtree className="h-6 w-6 text-green-700" />,
//   default: <Sprout className="h-6 w-6 text-green-600" />,
// };

export function PlantFieldGrid({ plantIds = [] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    async function fetchPlants() {
      if (!plantIds.length) {
        setPlants([]);
        return;
      }

      setLoading(true);
      try {
        const fetchedPlants = await getPlantsByIds(plantIds);
        setPlants(fetchedPlants);
        setError(null);
      } catch (err) {
        console.error("Error fetching plants:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPlants();
  }, [plantIds]);
  // Mock data for plant fields
  // const plantFields = [
  //   {
  //     id: 1,
  //     plantName: "Tomato",
  //     lastUpdated: "2 days ago",
  //     icon: <Cherry className={`${iconClasses} text-red-500`} />,
  //     status: "Growing",
  //     image: tomatoImage,
  //   },
  //   {
  //     id: 2,
  //     plantName: "Lettuce",
  //     lastUpdated: "5 days ago",
  //     icon: <Salad className={`${iconClasses} text-green-500`} />,
  //     status: "Ready for Harvest",
  //     image: tomatoImage,
  //   },
  //   {
  //     id: 3,
  //     plantName: "Basil",
  //     lastUpdated: "1 day ago",
  //     icon: <Sprout className={`${iconClasses} text-green-600`} />,
  //     status: "Growing",
  //     image: tomatoImage,
  //   },
  //   {
  //     id: 4,
  //     plantName: "Apple Tree",
  //     lastUpdated: "1 week ago",
  //     icon: <Apple className={`${iconClasses} text-red-600`} />,
  //     status: "Attention",
  //     image: tomatoImage,
  //   },
  //   {
  //     id: 5,
  //     plantName: "Rice",
  //     lastUpdated: "3 days ago",
  //     icon: <Wheat className={`${iconClasses} text-amber-600`} />,
  //     status: "Growing",
  //     image: tomatoImage,
  //   },
  //   {
  //     id: 6,
  //     plantName: "Palm",
  //     lastUpdated: "2 weeks ago",
  //     icon: <Palmtree className={`${iconClasses} text-green-700`} />,
  //     status: "Harvested",
  //     image: tomatoImage,
  //   },
  // ];
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        {/* <Progress></Progress>
         */}
        Loading...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center py-8 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }
  if (plants.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No plants found in this area. Let add some plants to get started!
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {plants.map(
        (plant) => (
          console.log(plant.imageUrl),
          (
            <PlantFieldCard
              key={plant.id}
              plantName={plant.plantVariety}
              lastUpdated={plant.lastUpdatedText}
              // icon={field.icon}
              status={plant.status}
              image={"/src/" + plant.imageUrl || defaultPlantImage}
              category={plant.category?.[0] || "Unknown"}
            />
          )
        )
      )}
    </div>
  );
}
