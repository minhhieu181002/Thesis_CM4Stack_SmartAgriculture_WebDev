import { Badge } from "@/components/ui/badge";

export function PlantFieldHeader({ plantName, status }) {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "growing":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "ready for harvest":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "harvested":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "needs attention":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="flex justify-between items-start">
      <h3 className="font-medium text-base">{plantName}</h3>
      <Badge variant="outline" className={`${getStatusColor(status)}`}>
        {status}
      </Badge>
    </div>
  );
}
