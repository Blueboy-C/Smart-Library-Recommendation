import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Recommendations from './pages/student/Recommendations';
import Profile from './pages/student/Profile';
import History from './pages/student/History';
import PathPlanner from './pages/student/PathPlanner';
import SemanticSearch from './pages/student/SemanticSearch';

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
