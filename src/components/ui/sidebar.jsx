import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { UserAuth } from "@/context/auth-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BarChart3, Droplets, Home, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar({ className, open }) {
  const { user, logOut } = UserAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // const toggleSidebar = () => {
  //   setOpen(!open);
  // };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Plant Management",
      path: "/plant-management",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: "Irrigation",
      path: "/irrigation",
      icon: <Droplets className="h-5 w-5" />,
    },
  ];

  return (
    <div
      className={cn(
        "bg-sidebar text-sidebar-foreground flex h-screen flex-col border-r transition-all duration-300",
        open ? "w-64" : "w-20",
        className
      )}
    >
      {/* Top Section - Profile */}
      <div
        className={cn(
          "flex flex-col items-center gap-2 p-6 border-b",
          !open && "px-2"
        )}
      >
        <div className="bg-sidebar-accent rounded-full p-2">
          <User className="h-8 w-8" />
        </div>
        {open && (
          <div className="flex flex-col items-center">
            <p className="font-semibold">Farm Management</p>
            {user && (
              <p className="text-sidebar-foreground/70 text-sm truncate max-w-[180px]">
                {user.email || user.displayName}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Middle Section - Navigation Menu */}
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "hover:bg-sidebar-accent/50 flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-all",
                location.pathname === item.path
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70",
                !open && "justify-center px-2"
              )}
              title={!open ? item.name : ""}
            >
              {item.icon}
              {open && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Section - Actions */}
      <div className="border-t p-4">
        <div
          className={cn(
            "flex items-center",
            open ? "justify-between" : "justify-center gap-2"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
