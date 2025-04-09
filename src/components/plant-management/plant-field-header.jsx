import { Badge } from "@/components/ui/badge";

export function PlantFieldHeader({ plantName, status, image }) {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "growing":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "ready for harvest":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "harvested":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "attention":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="flex flex-col w-full gap-3">
      {/* Image container */}
      {image && (
        <div className="w-full flex justify-center mb-2">
          <img
            src={image}
            alt={`${plantName} image`}
            className="rounded-md object-cover h-40 w-full"
          />
        </div>
      )}

      {/* Plant name and status */}
      <div className="flex justify-between w-full items-center">
        <h3 className="font-medium text-base">{plantName}</h3>
        <Badge variant="outline" className={`${getStatusColor(status)}`}>
          {status}
        </Badge>
      </div>
    </div>
  );
}
