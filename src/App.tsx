import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HRMSProvider from './context/HRMSProvider';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeForm from './pages/EmployeeForm';
import EmployeeDetail from './pages/EmployeeDetail';
import Departments from './pages/Departments';
import Positions from './pages/Positions';
import OrgChart from './pages/OrgChart';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <HRMSProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/new" element={<EmployeeForm />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
            <Route path="/employees/:id/edit" element={<EmployeeForm />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/org-chart" element={<OrgChart />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HRMSProvider>
  );
}
