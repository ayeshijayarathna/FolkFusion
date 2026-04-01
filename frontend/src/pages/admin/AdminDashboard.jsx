import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, Heart, Calendar, Bell, 
  MessageSquare, Settings, ShoppingBag, Landmark, Newspaper,
  Menu, X, LogOut, User, ChevronDown, Palette, Home, Inbox,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { notificationAPI } from '../../services/api';
import { adminAPI } from '../../services/api';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import Overview                   from '../../pages/admin/sections/Overview';
import ArtistManagement           from '../../pages/admin/sections/ArtistManagement';
import CourseManagement           from '../../pages/admin/sections/CourseManagement';
import DonationManagement         from '../../pages/admin/sections/DonationManagement';
import EventManagement            from '../../pages/admin/sections/EventManagemnt/EventManagement';
import NewsManagement             from '../../pages/admin/sections/Newsmanagement';
import Notifications              from '../../pages/admin/sections/Notifications';
import ContactAdmins              from '../../pages/admin/sections/ContactAdmins';
import ProfileSettings            from '../../pages/admin/sections/ProfileSettings';
import SalesManagement            from '../../pages/admin/sections/SalesManagement';
import HistoricalPlacesManagement from '../../pages/admin/sections/HistoricalPlacesManagement';
import ArtworkManagement          from '../../pages/admin/sections/ArtworkManagement';
import InquiryManagement          from '../../pages/admin/sections/Inquirymanagement ';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen]         = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [adminProfile, setAdminProfile]           = useState(null);
  const [lang, setLang]                           = useState('en');

  const location   = useLocation();
  const navigate   = useNavigate();
  const { logout, user } = useAuth();

  const { unreadCount, setUnreadCount } = useSocket();

  const currentPath = location.pathname;

  useEffect(() => { fetchAdminProfile(); }, []);

  useEffect(() => {
    const saved = localStorage.getItem('ff_lang') || 'en';
    setLang(saved);
    const onStorage = (e) => { if (e.key === 'ff_lang') setLang(e.newValue || 'en'); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const response = await adminAPI.getMyProfile();
      if (response.data.success) setAdminProfile(response.data.data.profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = () => { logout(); navigate('/system/admin-portal'); };
  const handleBackToHome = () => { setIsProfileMenuOpen(false); navigate('/'); };

  const menuItems = [
    { path: '/admin/overview',          label: 'Overview',          icon: LayoutDashboard },
    { path: '/admin/artists',           label: 'Artists',           icon: Users           },
    { path: '/admin/courses',           label: 'Courses',           icon: BookOpen        },
    { path: '/admin/donations',         label: 'Donations',         icon: Heart           },
    { path: '/admin/events',            label: 'Events',            icon: Calendar        },
    { path: '/admin/news',              label: 'News',              icon: Newspaper       },
    { path: '/admin/historical-places', label: 'Historical Places', icon: Landmark        },
    { path: '/admin/sales',             label: 'Sales Management',  icon: ShoppingBag     },
    { path: '/admin/inquiries',         label: 'Inquiries',         icon: Inbox           },
    { path: '/admin/notifications',     label: 'Notifications',     icon: Bell            },
    { path: '/admin/contact-admins',    label: 'Contact Admins',    icon: MessageSquare   },
    { path: '/admin/profile-settings',  label: 'Profile Settings',  icon: Settings        },
    { path: '/admin/artworks',          label: 'Artworks',          icon: Palette         },
  ];

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const activeLabel =
    menuItems.find(item =>
      item.path === '/admin/events'
        ? currentPath.startsWith('/admin/events')
        : currentPath === item.path
    )?.label || 'Dashboard';

  return (
    <div className="flex min-h-screen bg-[#FAF7F2]" style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px' }}>

      {/*sidebar*/}
      <aside className={`
        fixed top-0 left-0 h-screen bg-[#A67C52] flex flex-col z-50 shadow-2xl
        transition-all duration-300 overflow-hidden
        ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-[72px]'}
      `}>
        {/* brand */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10 flex-shrink-0 min-w-0">
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-white text-sm font-bold truncate" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                FolkFusion
              </p>
              <p className="text-[10px] tracking-[.18em] text-[#FFF8E1] mt-0.5">ADMIN PANEL</p>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(p => !p)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 ml-auto text-white"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* nav */}
        <nav className="flex-1 py-3 overflow-y-auto px-2 space-y-0.5">
          {menuItems.map(({ path, label, icon: Icon }) => {
            const isActive = path === '/admin/events'
              ? currentPath.startsWith('/admin/events')
              : currentPath === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
                  border-l-[3px] whitespace-nowrap overflow-hidden
                  ${isActive
                    ? 'bg-[#FFF8E1]/20 text-white border-[#FFF8E1]'
                    : 'text-white/55 hover:text-white hover:bg-white/10 border-transparent'
                  }
                  ${!isSidebarOpen ? 'lg:justify-center' : ''}`}
              >
                <Icon size={17} className="flex-shrink-0" />
                {isSidebarOpen && <span className="truncate flex-1">{label}</span>}
                {isSidebarOpen && path === '/admin/notifications' && unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#A67C52] text-white border border-white/30">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* user strip */}
        {isSidebarOpen && (
          <div className="border-t border-white/10 p-3 flex-shrink-0">
            <div className="flex items-center gap-3 bg-white/8 rounded-xl px-3 py-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFF8E1] to-[#D4A855] flex items-center justify-center flex-shrink-0">
                {adminProfile?.profilePhoto ? (
                  <img src={adminProfile.profilePhoto} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-[#A67C52] text-[11px] font-bold">{getInitials(adminProfile?.fullName)}</span>
                )}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-white text-[12px] font-semibold truncate">{adminProfile?.fullName || 'Admin User'}</p>
                <p className="text-white/50 text-[10px] truncate">{adminProfile?.email || user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#FFF8E1] border border-[#FFF8E1]/30 hover:bg-[#FFF8E1]/10 transition-all text-[12px] font-medium"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* main*/}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0 lg:ml-[72px]'}`}>

        {/* header */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#E8DDD5] shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between px-6 py-[14px]">
            <div className="flex items-center gap-3">
              {/* mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(p => !p)}
                className="p-2 rounded-lg hover:bg-[#FAF7F2] transition-colors text-[#3D3530] lg:hidden"
              >
                <Menu size={20} />
              </button>
              {/* breadcrumb */}
              <div className="flex items-center gap-2 text-[13px]">
                <span className="text-[#9A8880]">Admin</span>
                <ChevronRight size={14} className="text-[#9A8880]" />
                <span
                  className="text-[#3D3530] font-semibold"
                  style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 13 }}
                >
                  {activeLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <LanguageSwitcher onLangChange={setLang} />
              </div>

              {/*notification bell */}
              <button
                onClick={() => navigate('/admin/notifications')}
                className="relative p-2 rounded-full hover:bg-[#FAF7F2] transition-colors"
              >
                <Bell size={20} className="text-[#3D3530]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[#C48A6A] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* avatar ,profile dropdown*/}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A67C52] to-[#D4A855] flex items-center justify-center shadow-sm">
                    {adminProfile?.profilePhoto ? (
                      <img src={adminProfile.profilePhoto} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white text-xs font-bold">{getInitials(adminProfile?.fullName)}</span>
                    )}
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-[#E8DDD5] overflow-hidden z-50">
                    <div className="p-2">
                      <button onClick={handleBackToHome} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FAF7F2] transition-all group">
                        <Home size={16} className="text-[#A67C52]" />
                        <span className="text-sm text-[#3D3530] font-medium">Back to Home</span>
                      </button>
                      <Link
                        to="/admin/profile-settings"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FAF7F2] transition-all group"
                      >
                        <User size={16} className="text-[#A67C52]" />
                        <span className="text-sm text-[#3D3530] font-medium">Profile Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-all group"
                      >
                        <LogOut size={16} className="text-red-500" />
                        <span className="text-sm text-red-500 font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* page content */}
        <div className="flex-1 p-6">
          <Routes>
            <Route path="/"                  element={<Navigate to="/admin/overview" replace />} />
            <Route path="/overview"          element={<Overview />} />
            <Route path="/artists"           element={<ArtistManagement />} />
            <Route path="/courses"           element={<CourseManagement />} />
            <Route path="/donations"         element={<DonationManagement />} />
            <Route path="/events"            element={<EventManagement />} />
            <Route path="/news"              element={<NewsManagement />} />
            <Route path="/historical-places" element={<HistoricalPlacesManagement />} />
            <Route path="/sales"             element={<SalesManagement />} />
            <Route path="/inquiries"         element={<InquiryManagement />} />
            <Route path="/notifications"     element={<Notifications />} />
            <Route path="/contact-admins"    element={<ContactAdmins />} />
            <Route path="/profile-settings"  element={<ProfileSettings />} />
            <Route path="/artworks"          element={<ArtworkManagement />} />
          </Routes>
        </div>
      </main>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;