import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { SuperAdminAuthProvider, useSuperAdminAuth } from './context/Superadminauthcontext'; // NEW
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Home from './pages/public/Home';

import ArtistLogin from './pages/Login/ArtistLogin';
import AdminLogin  from './pages/Login/AdminLogin';
import ArtistDashboard from './pages/artist/ArtistDashboard';
import AdminDashboard  from './pages/admin/AdminDashboard';

// super admin pages
import SuperAdminLogin     from './pages/Login/SuperAdminLogin';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

import './App.css';

import News                   from './pages/public/News/News';
import NewsDetail             from './pages/public/News/NewsDetail';
import HistoricalPlaces       from './pages/public/Historical_places/HistoricalPlaces';
import HistoricalPlaceDetail  from './pages/public/Historical_places/HistoricalPlaceDetail';
import Partnership            from './pages/public/Partnership';
import PrivacyPolicy          from './pages/public/PrivacyPolicy';
import TermsAndConditions     from './pages/public/TermsAndConditions';
import Events                 from './pages/public/Events/Events';
import EventDetail            from './pages/public/Events/EventDetail';
import Artists                from './pages/public/Artists/Artists';
import ArtistDetail           from './pages/public/Artists/ArtistDetail';
import Gallery                from './pages/public/Gallery/Gallery';
import ArtworkDetail          from './pages/public/Gallery/ArtworkDetail';
import Courses                from './pages/public/Courses/Courses';
import CourseDetail           from './pages/public/Courses/CourseDetail';
import Marketplace            from './pages/public/Marketplace/Marketplace';
import CheckoutModal          from './pages/public/Marketplace/CheckoutModal';
import OrderTracking          from './pages/public/Marketplace/OrderTracking';
import DonatePage             from './pages/public/Donation';
import Categories             from './pages/public/Categories/Categories';

//protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF8E7' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C2581F]"></div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

//protected route for super admin
const SuperAdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSuperAdminAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF7F2' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#C97B5A' }}></div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/system/super-admin" replace />;
  return children;
};

function ConditionalFooter() {
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/super-admin');
  const isDashboard  = location.pathname.startsWith('/admin') || location.pathname.startsWith('/artist/dashboard');
  const isLogin      = ['/login', '/system/admin-portal', '/system/super-admin'].includes(location.pathname);
  if (isDashboard || isLogin || isSuperAdmin) return null;
  return <Footer />;
}

function ConditionalNavbar() {
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/super-admin');
  const isDashboard  = location.pathname.startsWith('/admin') || location.pathname.startsWith('/artist/dashboard');
  const isLogin      = ['/login', '/system/admin-portal', '/system/super-admin'].includes(location.pathname);
  if (isDashboard || isLogin || isSuperAdmin) return null;
  return <Navbar />;
}

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const { isAuthenticated: isSuperAdminAuth } = useSuperAdminAuth();

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <ConditionalNavbar />
        <main className="flex-grow">
          <Routes>
            {/* public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={
              isAuthenticated
                ? <Navigate to={user?.role === 'artist' ? '/artist/dashboard' : '/admin/dashboard'} replace />
                : <ArtistLogin />
            } />
            <Route path="/system/admin-portal" element={
              isAuthenticated
                ? <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/artist/dashboard'} replace />
                : <AdminLogin />
            } />

            {/* super admin */}
            <Route path="/system/super-admin" element={
              isSuperAdminAuth
                ? <Navigate to="/super-admin/dashboard" replace />
                : <SuperAdminLogin />
            } />

            {/* super admin dashboard */}
            <Route path="/super-admin/dashboard/*" element={
              <SuperAdminProtectedRoute>
                <SuperAdminDashboard />
              </SuperAdminProtectedRoute>
            } />

            {/* regular dashboards */}
            <Route path="/admin/*"            element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/artist/dashboard/*" element={<ProtectedRoute allowedRoles={['artist']}><ArtistDashboard /></ProtectedRoute>} />

            {/* public pages */}
            <Route path="/news"               element={<News />} />
            <Route path="/news/:id"           element={<NewsDetail />} />
            <Route path="/historical-places"  element={<HistoricalPlaces />} />
            <Route path="/historical-places/:id" element={<HistoricalPlaceDetail />} />
            <Route path="/events"             element={<Events />} />
            <Route path="/events/:id"         element={<EventDetail />} />
            <Route path="/artists"            element={<Artists />} />
            <Route path="/artists/:id"        element={<ArtistDetail />} />
            <Route path="/gallery"            element={<Gallery />} />
            <Route path="/gallery/:id"        element={<ArtworkDetail />} />
            <Route path="/categories"         element={<Categories />} />
            <Route path="/partnership"        element={<Partnership />} />
            <Route path="/privacy-policy"     element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/marketplace"        element={<Marketplace />} />
            <Route path="/marketplace/checkout" element={<CheckoutModal />} />
            <Route path="/track-order"        element={<OrderTracking />} />
            <Route path="/track-order/:ref"   element={<OrderTracking />} />
            <Route path="/courses"            element={<Courses />} />
            <Route path="/courses/:id"        element={<CourseDetail />} />
            <Route path="/donations"          element={<DonatePage />} />
            <Route path="/learning"           element={<div style={{ paddingTop: 120, textAlign: 'center' }}><h1>Learning Page</h1><p>Coming Soon</p></div>} />
            <Route path="*"                   element={<div style={{ paddingTop: 120, textAlign: 'center' }}><h1>404 - Not Found</h1></div>} />
          </Routes>
        </main>
        <ConditionalFooter />
        <Chatbot />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <SuperAdminAuthProvider>   
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </SuperAdminAuthProvider>
    </AuthProvider>
  );
}

export default App;