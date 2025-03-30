import { Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAuth } from "@/context/AuthContext";

function HeaderGreeting() {
  const { user } = UserAuth();
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-semibold">Welcome Back, {displayName}!</h1>
      {/* <p className="text-muted-foreground text-sm">Welcome back to the dashboard</p> */}
    </div>
  );
}

function NotificationIcon() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full hover:bg-accent transition-colors"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      <span className="sr-only">Notifications</span>
    </Button>
  );
}
function SearchBar() {
  return (
    <div className="w-64">
      <Input
        type="search"
        placeholder="Search..."
        className="w-full bg-background"
      />
    </div>
  );
}

export function Header() {
  return (
    <header className="bg-card py-4 px-6 border-b flex items-center justify-between mr-20">
      <HeaderGreeting />
      <div className="flex items-center gap-2">
        <SearchBar />
        <NotificationIcon />
      </div>
    </header>
  );
}
