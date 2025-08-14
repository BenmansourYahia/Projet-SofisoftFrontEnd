import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Stores from "./pages/Stores";
import Stock from "./pages/Stock";
import Sales from "./pages/Sales";
import Comparateur from "./pages/Comparateur";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import SplashScreen from "@/components/ui/SplashScreen";

const queryClient = new QueryClient();

import React from "react";

const App = () => {
  const [showSplash, setShowSplash] = React.useState(true);
  const handleSplashFinish = () => setShowSplash(false);
  return (
    <QueryClientProvider client={queryClient}>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      {!showSplash && (
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/stores" element={
                  <ProtectedRoute>
                    <Stores />
                  </ProtectedRoute>
                } />
                <Route path="/stock" element={
                  <ProtectedRoute>
                    <Stock />
                  </ProtectedRoute>
                } />
                <Route path="/sales" element={
                  <ProtectedRoute>
                    <Sales />
                  </ProtectedRoute>
                } />
                <Route path="/comparateur" element={
                  <ProtectedRoute>
                    <Comparateur />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      )}
    </QueryClientProvider>
  );
};

export default App;
