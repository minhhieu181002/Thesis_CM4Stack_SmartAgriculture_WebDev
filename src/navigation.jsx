import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "./context/auth-context";
import { Button } from "./components/ui/button";

function Navigation() {
  const { user, logOut } = UserAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="bg-primary p-4 flex justify-between items-center">
      <div className="flex gap-4">
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="text-primary-foreground hover:underline"
            >
              Dashboard
            </Link>
            <Link
              to="/plant-management"
              className="text-primary-foreground hover:underline"
            >
              Plant Management
            </Link>
          </>
        ) : (
          <Link to="/login" className="text-primary-foreground hover:underline">
            Login
          </Link>
        )}
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-primary-foreground">
            {user.email || user.displayName}
          </span>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
