import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Recommendations from './pages/student/Recommendations';
import Profile from './pages/student/Profile';
import History from './pages/student/History';
import PathPlanner from './pages/student/PathPlanner';
import SemanticSearch from './pages/student/SemanticSearch';
import InterestOverview from './pages/teacher/InterestOverview';
import ClusterView from './pages/teacher/ClusterView';
import InsightReport from './pages/teacher/InsightReport';
import ResourceDetail from './pages/student/ResourceDetail';
import AdminDashboard from './pages/admin/Dashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Recommendations />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="/path-planner" element={<PathPlanner />} />
          <Route path="/search" element={<SemanticSearch />} />
          <Route path="/teacher/overview" element={<InterestOverview />} />
          <Route path="/teacher/clusters" element={<ClusterView />} />
          <Route path="/teacher/insight" element={<InsightReport />} />
          <Route path="/resource/:type/:id" element={<ResourceDetail />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
