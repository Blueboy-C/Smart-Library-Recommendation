import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Recommendations from './pages/student/Recommendations';
import Profile from './pages/student/Profile';
import History from './pages/student/History';
import PathPlanner from './pages/student/PathPlanner';
import SemanticSearch from './pages/student/SemanticSearch';
import InterestOverview from './pages/teacher/InterestOverview';
import ClusterView from './pages/teacher/ClusterView';
import InsightReport from './pages/teacher/InsightReport';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Recommendations />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="/path-planner" element={<PathPlanner />} />
          <Route path="/search" element={<SemanticSearch />} />
          <Route path="/teacher/overview" element={<InterestOverview />} />
          <Route path="/teacher/clusters" element={<ClusterView />} />
          <Route path="/teacher/insight" element={<InsightReport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
