import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/macroscopia" element={<div>Macroscopia Placeholder</div>} />
          <Route path="/mamaria" element={<div>Mamaria Placeholder</div>} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;
