import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import "./App.css";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import Hackathons from "./pages/Hackathons";
import Notifications from "./pages/Notifications";
import HackathonDetail from "./pages/HackathonDetail";
import CreateHackathon from "./pages/CreateHackathon";
import MyCoordinations from "./pages/MyCoordinations";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import JudgeDashboard from "./pages/JudgeDashboard";
import TeamDetail from "./pages/TeamDetail";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import TeamRequests from "./pages/TeamRequests";
import EditHackathon from "./pages/EditHackathon";
import TeamApprovals from "./pages/TeamApprovals";
import CoordinatorTest from './pages/CoordinatorTest';



// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!user?.roles || !allowedRoles.some(r => user.roles.includes(r)))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function DashboardRouter() {
  const { user } = useAuthStore();
  const roles = user.roles || [];

  if (roles.includes("admin")) return <AdminDashboard />;
  if (roles.includes("judge")) return <JudgeDashboard />;

  return <Dashboard />; // student / default user
}



function App() {
  
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="/hackathons/:id" element={<HackathonDetail />} />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

              <Route path="/test-coordinator" element={<CoordinatorTest />} />

            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}


            {/* Admin Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team-requests"
              element={
                <ProtectedRoute>
                  <TeamRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-hackathon"
              element={
                <ProtectedRoute>
                  <CreateHackathon />
                </ProtectedRoute>
              }
            />
            <Route 
     path="/hackathons/:id/edit" 
     element={
       <ProtectedRoute>
         <EditHackathon />
       </ProtectedRoute>
     } 
   />
            <Route 
     path="/hackathons/:id/approvals" 
     element={
       <ProtectedRoute>
         <TeamApprovals />
       </ProtectedRoute>
     } 
   />
            <Route
              path="/my-coordinations"
              element={
                <ProtectedRoute>
                  <MyCoordinations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coordinator/:hackathonId"
              element={
                <ProtectedRoute>
                  <CoordinatorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/judge/:hackathonId"
              element={
                <ProtectedRoute>
                  <JudgeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams/:id"
              element={
                <ProtectedRoute>
                  <TeamDetail />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10B981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#EF4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
