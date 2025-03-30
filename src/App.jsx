import "./App.css";
import Dashboard from "./pages/Dashboard";
import PlantManagement from "./pages/PlantManagement";
import LoginPage from "./pages/LoginPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Sidebar } from "./components/ui/sidebar";
import { ThemeProvider } from "./components/ui/theme-provider";
import { UserAuth } from "./context/AuthContext";

// Layout component that includes the sidebar
function Layout({ children }) {
  const { user } = UserAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar className="shrink-0" />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/plant-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PlantManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/irrigation"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div>Irrigation Page</div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthContextProvider>
    </ThemeProvider>
  );
}

export default App;
