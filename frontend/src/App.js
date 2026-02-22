import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from '@/pages/LandingPage';
import StudentRegister from '@/pages/StudentRegister';
import CompanyRegister from '@/pages/CompanyRegister';
import Dashboard from '@/pages/Dashboard';
import Rankings from '@/pages/Rankings';
import '@/App.css';

function App() {
  return (
    <div className="App min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/student/register" element={<StudentRegister />} />
          <Route path="/company/register" element={<CompanyRegister />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rankings/:companyId" element={<Rankings />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
