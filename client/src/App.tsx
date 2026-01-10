import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Macroscopy from './pages/Macroscopy';

import Mammary from './pages/Mammary';

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/macroscopia" element={<Macroscopy />} />
          <Route path="/mamaria" element={<Mammary />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;
