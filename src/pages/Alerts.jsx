import { useState, useEffect } from "react";
import { useNotifications } from "@/context/notification-context";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Thermometer, Bell, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Alerts() {
  const { notifications, markAsRead, clearNotifications, markAllAsRead } =
    useNotifications();
  const [activeTab, setActiveTab] = useState("all");
  const [filteredNotifications, setFilteredNotifications] = useState([]);

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredNotifications(notifications);
    } else if (activeTab === "unread") {
      setFilteredNotifications(notifications.filter((n) => !n.read));
    } else if (activeTab === "critical") {
      setFilteredNotifications(
        notifications.filter((n) => {
          const temp = parseFloat(n.temperatureValue);
          return !isNaN(temp) && temp >= 35;
        })
      );
    }
  }, [activeTab, notifications]);

  // Determine severity class
  const getSeverityClass = (value) => {
    if (!value || value === "unknown") return "border-gray-200 bg-gray-50";
    const temp = parseFloat(value);
    if (temp >= 35) return "border-red-200 bg-red-50";
    if (temp >= 30) return "border-orange-200 bg-orange-50";
    if (temp >= 25) return "border-yellow-200 bg-yellow-50";
    return "border-blue-200 bg-blue-50";
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return format(date, "MMM d, yyyy h:mm a");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">
          <Bell className="mr-3 h-7 w-7" />
          Notification Alerts
        </h1>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={!notifications.length}
          >
            Mark All as Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearNotifications}
            disabled={!notifications.length}
          >
            Clear All
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Alert History</CardTitle>
          <CardDescription>
            View all temperature alerts received from your containers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All Alerts ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({notifications.filter((n) => !n.read).length})
              </TabsTrigger>
              <TabsTrigger value="critical">
                Critical (
                {
                  notifications.filter(
                    (n) => parseFloat(n.temperatureValue) >= 35
                  ).length
                }
                )
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium">No alerts to display</h3>
                  <p className="text-sm mt-1">
                    {activeTab === "all"
                      ? "You haven't received any temperature alerts yet."
                      : activeTab === "unread"
                      ? "You have no unread alerts."
                      : "No critical temperature alerts detected."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg ${getSeverityClass(
                        notification.temperatureValue
                      )} ${
                        !notification.read ? "ring-2 ring-blue-300" : ""
                      } transition-all hover:shadow-md`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium flex items-center">
                            <Thermometer className="mr-2 h-4 w-4" />
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {notification.body}
                          </p>
                        </div>
                        <div className="text-sm font-medium py-1 px-3 rounded-full bg-white border">
                          {notification.temperatureValue}°C
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <p className="text-xs text-gray-500">
                          {formatTime(notification.timestamp)}
                        </p>
                        {!notification.read && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Unread
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
