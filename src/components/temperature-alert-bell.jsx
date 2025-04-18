import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useNotifications } from "@/context/notification-context";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export function TemperatureAlertBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
    markAllAsRead,
    permissionGranted,
    requestPermission,
  } = useNotifications();

  const navigate = useNavigate();

  const handleMarkAllAsRead = (e) => {
    e.preventDefault();
    e.stopPropagation();
    markAllAsRead();
  };

  const handleClearAll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearNotifications();
  };

  const handleViewAllAlerts = () => {
    navigate("/alerts");
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (!granted) {
      alert(
        "Please enable notifications in your browser settings to receive temperature alerts."
      );
    }
  };

  // Determine temperature notification status color
  const getStatusColor = (value) => {
    if (!value || value === "unknown") return "bg-gray-100 text-gray-500";
    const temp = parseFloat(value);
    if (temp >= 35) return "bg-red-100 text-red-600";
    if (temp >= 30) return "bg-orange-100 text-orange-600";
    if (temp >= 25) return "bg-yellow-100 text-yellow-600";
    return "bg-blue-100 text-blue-600";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative" size="icon">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white p-0 min-w-[20px]">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-[600px] overflow-y-auto"
      >
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notification Alerts</span>
          <div className="flex gap-1">
            {notifications.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-8 px-2 text-xs"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-8 px-2 text-xs"
                  title="Clear all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {!permissionGranted ? (
          <DropdownMenuItem
            onClick={handleRequestPermission}
            className="cursor-pointer"
          >
            <div className="p-2 text-center w-full">
              <p className="text-sm font-medium">Enable Notifications</p>
              <p className="text-xs text-muted-foreground mt-1">
                Get alerted when temperature reaches critical levels
              </p>
              <Button size="sm" className="mt-2 w-full">
                Enable Notifications
              </Button>
            </div>
          </DropdownMenuItem>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No temperature alerts
          </div>
        ) : (
          <>
            <DropdownMenuGroup>
              {notifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start p-3 cursor-pointer ${
                    notification.read ? "" : "bg-blue-50"
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="font-medium flex items-center gap-2">
                    {notification.title}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {notification.body}
                  </div>
                  <div className="flex justify-between w-full items-center mt-2">
                    <div
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        notification.temperatureValue
                      )}`}
                    >
                      {notification.temperatureValue}°C
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {notification.timestamp instanceof Date
                        ? format(notification.timestamp, "MMM d, h:mm a")
                        : new Date(notification.timestamp).toLocaleString()}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            {notifications.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleViewAllAlerts}
                >
                  <div className="text-center w-full text-sm text-blue-500 font-medium">
                    View all alerts ({notifications.length})
                  </div>
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
