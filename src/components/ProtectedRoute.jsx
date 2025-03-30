import { Navigate } from "react-router-dom";
import { UserAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = UserAuth();

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
