// import "./App.css";
import Dashboard from "./pages/Dashboard";
import PlantManagement from "./pages/PlantManagement";
import LoginPage from "./pages/LoginPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContextProvider } from "./context/auth-context";
import { CabinetProvider } from "./context/cabinet-context";
import ProtectedRoute from "./components/protected-route";
import { Sidebar } from "./components/ui/sidebar";
import { ThemeProvider } from "./components/ui/theme-provider";
import { UserAuth } from "./context/auth-context";
import { Header } from "./components/ui/header";
import Irrigation from "./pages/Irrigation";
import { useState } from "react";

// Layout component that includes the sidebar
function Layout({ children }) {
  const { user } = UserAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar className="shrink-0" open={sidebarOpen} />
      <div className="flex flex-col flex-1">
        <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthContextProvider>
        <CabinetProvider>
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
                      <Irrigation />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </CabinetProvider>
      </AuthContextProvider>
    </ThemeProvider>
  );
}

export default App;
