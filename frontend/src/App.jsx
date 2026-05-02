import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { SuperAdminAuthProvider, useSuperAdminAuth } from './context/Superadminauthcontext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Home from './pages/public/Home';

import ArtistLogin from './pages/Login/ArtistLogin';
import AdminLogin  from './pages/Login/AdminLogin';
import ArtistDashboard from './pages/artist/ArtistDashboard';
import AdminDashboard  from './pages/admin/AdminDashboard';

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
import LearningPage           from './pages/public/Learning/LearningPage';
import ARViewer               from './pages/public/ARViewer/ARViewer';

/*Get correct dashboard path based on user role*/
const getDashboardPath = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'artist') return '/artist/dashboard';
  return '/'; 
};

const getLoginPathForRoute = (pathname) => {
  if (pathname.startsWith('/admin')) return '/system/admin-portal';
  if (pathname.startsWith('/artist')) return '/login';
  return '/login'; 
};

/*protected route*/
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF8E7' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C2581F]"/>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={getLoginPathForRoute(location.pathname)} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return children;
};

/*super admin protected route*/
const SuperAdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSuperAdminAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF7F2' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#C97B5A' }}/>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/system/super-admin" replace />;
  return children;
};

/*conditional footer*/
function ConditionalFooter() {
  const location = useLocation();
  const path = location.pathname;
  const hide =
    path.startsWith('/super-admin')      ||
    path.startsWith('/admin')            ||
    path.startsWith('/artist/dashboard') ||
    path.startsWith('/ar-view')          ||
    ['/login', '/system/admin-portal', '/system/super-admin'].includes(path);
  if (hide) return null;
  return <Footer />;
}

/* ── Conditional Navbar ── */
function ConditionalNavbar() {
  const location = useLocation();
  const path = location.pathname;
  const hide =
    path.startsWith('/super-admin')      ||
    path.startsWith('/admin')            ||
    path.startsWith('/artist/dashboard') ||
    path.startsWith('/ar-view')          ||
    ['/login', '/system/admin-portal', '/system/super-admin'].includes(path);
  if (hide) return null;
  return <Navbar />;
}

/*Conditional Chatbot (hide on AR page)*/
function ConditionalChatbot() {
  const location = useLocation();
  if (location.pathname.startsWith('/ar-view')) return null;
  return <Chatbot />;
}

function AppContent() {
  const { isAuthenticated, user, loading } = useAuth();
  const { isAuthenticated: isSuperAdminAuth } = useSuperAdminAuth();

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <ConditionalNavbar />
        <main className="flex-grow">
          <Routes>
            {/* public */}
            <Route path="/" element={<Home />} />

            {/* artist login page*/}
            <Route path="/login" element={
              loading
                ? null
                : isAuthenticated && user?.role
                  ? <Navigate to={getDashboardPath(user.role)} replace />
                  : <ArtistLogin />
            } />

            {/* admin login pg*/}
            <Route path="/system/admin-portal" element={
              loading
                ? null
                : isAuthenticated && user?.role
                  ? <Navigate to={getDashboardPath(user.role)} replace />
                  : <AdminLogin />
            } />

            {/* super admin */}
            <Route path="/system/super-admin" element={
              isSuperAdminAuth
                ? <Navigate to="/super-admin/dashboard" replace />
                : <SuperAdminLogin />
            } />
            <Route path="/super-admin/dashboard/*" element={
              <SuperAdminProtectedRoute>
                <SuperAdminDashboard />
              </SuperAdminProtectedRoute>
            } />

            {/* dashboards */}
            <Route path="/admin/*"            element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/artist/dashboard/*" element={<ProtectedRoute allowedRoles={['artist']}><ArtistDashboard /></ProtectedRoute>} />

            {/* public pages */}
            <Route path="/news"                    element={<News />} />
            <Route path="/news/:id"                element={<NewsDetail />} />
            <Route path="/historical-places"       element={<HistoricalPlaces />} />
            <Route path="/historical-places/:id"   element={<HistoricalPlaceDetail />} />
            <Route path="/events"                  element={<Events />} />
            <Route path="/events/:id"              element={<EventDetail />} />
            <Route path="/artists"                 element={<Artists />} />
            <Route path="/artists/:id"             element={<ArtistDetail />} />
            <Route path="/gallery"                 element={<Gallery />} />
            <Route path="/gallery/:id"             element={<ArtworkDetail />} />
            <Route path="/categories"              element={<Categories />} />
            <Route path="/partnership"             element={<Partnership />} />
            <Route path="/privacy-policy"          element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions"    element={<TermsAndConditions />} />
            <Route path="/marketplace"             element={<Marketplace />} />
            <Route path="/marketplace/checkout"    element={<CheckoutModal />} />
            <Route path="/track-order"             element={<OrderTracking />} />
            <Route path="/track-order/:ref"        element={<OrderTracking />} />
            <Route path="/courses"                 element={<Courses />} />
            <Route path="/courses/:id"             element={<CourseDetail />} />
            <Route path="/donations"               element={<DonatePage />} />
            <Route path="/learning"                element={<LearningPage />} />
            <Route path="/ar-view/:id"             element={<ARViewer />} />
            <Route path="*"                        element={<div style={{ paddingTop: 120, textAlign: 'center' }}><h1>404 - Not Found</h1></div>} />
          </Routes>
        </main>
        <ConditionalFooter />
        <ConditionalChatbot />
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