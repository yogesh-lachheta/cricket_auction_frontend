import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppSelector } from '@shared/hooks/redux';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Auth Pages
import Login from '@pages/auth/Login';
import Signup from '@pages/auth/Signup';
import VerifyOTP from '@pages/auth/VerifyOTP';

// Protected Pages
import Dashboard from '@pages/dashboard';
import ProtectedRoute from '@shared/components/ProtectedRoute';

// Player Pages
import { PlayerList, CreatePlayer, EditPlayer } from '@pages/players';

// Team Pages
import { TeamList, CreateTeam, ViewTeam } from '@pages/teams';

// Auction Pages
import { AuctionList, CreateAuction, ConfigureAuction, LiveBidding } from '@pages/auctions';

function App() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />}
        />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Player Routes */}
        <Route
          path="/players"
          element={
            <ProtectedRoute>
              <PlayerList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/players/create"
          element={
            <ProtectedRoute requiredRoles={['admin', 'auctioneer']}>
              <CreatePlayer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/players/:id/edit"
          element={
            <ProtectedRoute requiredRoles={['admin', 'auctioneer']}>
              <EditPlayer />
            </ProtectedRoute>
          }
        />

        {/* Team Routes */}
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <TeamList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/create"
          element={
            <ProtectedRoute requiredRoles={['team_owner', 'admin']}>
              <CreateTeam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:id"
          element={
            <ProtectedRoute>
              <ViewTeam />
            </ProtectedRoute>
          }
        />

        {/* Auction Routes */}
        <Route
          path="/auctions"
          element={
            <ProtectedRoute>
              <AuctionList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auctions/create"
          element={
            <ProtectedRoute requiredRoles={['admin', 'auctioneer']}>
              <CreateAuction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auctions/:id/configure"
          element={
            <ProtectedRoute requiredRoles={['admin', 'auctioneer']}>
              <ConfigureAuction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auctions/:id/live"
          element={
            <ProtectedRoute>
              <LiveBidding />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800 dark:text-white">404</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">
                  Page not found
                </p>
              </div>
            </div>
          }
        />
      </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
