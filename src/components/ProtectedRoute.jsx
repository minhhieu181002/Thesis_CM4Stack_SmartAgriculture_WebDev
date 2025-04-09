import { Navigate } from "react-router-dom";
import { UserAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  // Get context with error handling
  const authContext = UserAuth();

  // Handle case when context is undefined (not inside provider)
  if (!authContext) {
    console.error(
      "AuthContext is undefined. Make sure ProtectedRoute is used inside AuthContextProvider"
    );
    return <Navigate to="/login" />;
  }

  const { user, loading } = authContext;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
