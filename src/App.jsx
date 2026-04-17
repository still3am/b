import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Book from './pages/Book';
import CalendarPage from './pages/CalendarPage';
import Loyalty from './pages/Loyalty';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminServices from './pages/admin/AdminServices';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminLoyalty from './pages/admin/AdminLoyalty';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #fff5f8, #ffeaf3, #ffd6e8, #fff5f8)' }}>
        <div className="text-center">
          <div className="font-cormorant text-5xl font-bold mb-4 animate-pulse" style={{ background:'linear-gradient(135deg,#db2777,#ec4899,#f472b6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            BOOKED
          </div>
          <div className="w-6 h-6 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/book" element={<Book />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/loyalty" element={<Loyalty />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
        <Route path="/admin/loyalty" element={<AdminLoyalty />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App