import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Matching from './pages/Matching';
import MissionTracker from './pages/MissionTracker';
import { ToastProvider } from './hooks/useToast';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-800">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/matching" element={<Matching />} />
            <Route path="/missions" element={<MissionTracker />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}
