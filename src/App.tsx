import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "@/components/RequireAuth";
import Index from "./pages/Index";
import Movies from "./pages/Movies";
import Showtimes from "./pages/Showtimes";
import MovieDetails from "./pages/MovieDetails";
import SeatSelection from "./pages/SeatSelection";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Analytics from "./pages/Analytics";
import TheaterManagement from "./pages/TheaterManagement";
import UserManagement from "./pages/UserManagement";
import MarketingDashboard from "./pages/MarketingDashboard";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import UserProfile from "@/pages/UserProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="movies" element={<Movies />} />
            <Route path="showtimes" element={<Showtimes />} />
            <Route path="movie/:id" element={<MovieDetails />} />
            
            {/* Protected Routes */}
            <Route path="seats/:id" element={
              <RequireAuth>
                <SeatSelection />
              </RequireAuth>
            } />
            <Route path="payment/:id" element={
              <RequireAuth>
                <Payment />
              </RequireAuth>
            } />
            <Route path="confirmation/:id" element={
              <RequireAuth>
                <Confirmation />
              </RequireAuth>
            } />
            <Route path="profile" element={
              <RequireAuth>
                <UserProfile />
              </RequireAuth>
            } />
            <Route path="admin" element={
              <RequireAuth>
                <Admin />
              </RequireAuth>
            } />
            <Route path="admin/analytics" element={
              <RequireAuth>
                <Analytics />
              </RequireAuth>
            } />
            <Route path="admin/theater-management" element={
              <RequireAuth>
                <TheaterManagement />
              </RequireAuth>
            } />
            <Route path="admin/user-management" element={
              <RequireAuth>
                <UserManagement />
              </RequireAuth>
            } />
            <Route path="admin/marketing" element={
              <RequireAuth>
                <MarketingDashboard />
              </RequireAuth>
            } />
            <Route path="admin/reports" element={
              <RequireAuth>
                <ReportsAnalytics />
              </RequireAuth>
            } />
            
            {/* Public Routes */}
            <Route path="auth" element={<Auth />} />
            <Route path="signup" element={<Auth />} /> 
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;