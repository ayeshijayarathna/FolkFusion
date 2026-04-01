import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, ShoppingCart, Image, Bell,
  Settings, Menu, X, LogOut, User, ChevronDown, Palette,
  Mail, MapPin, Camera, Home, MessageSquare, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { notificationAPI, artistAPI } from '../../services/api';
import LanguageSwitcher from '../../components/LanguageSwitcher';

import Overview              from './sections/Overview';
import ArtworkManagement     from './sections/ArtworkManagement';
import MarketplaceManagement from './sections/MarketplaceManagement';
import OrderManagement       from './sections/OrderManagement';
import Notifications         from './sections/Notifications';
import ProfileManagement     from './sections/ProfileManagement';
import ArtistInquiries       from './sections/ArtistInquiries';

const ArtistDashboard = () => {
  const [isSidebarOpen,     setIsSidebarOpen]    = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [artistProfile,     setArtistProfile]     = useState(null);
  const [profileLoading,    setProfileLoading]    = useState(true);
  const [lang,              setLang]              = useState('en');

  const profileMenuRef = useRef(null);
  const location       = useLocation();
  const navigate       = useNavigate();
  const { logout, user } = useAuth();

  const { unreadCount, setUnreadCount } = useSocket();

  const currentPath = location.pathname;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const res = await artistAPI.getMyProfile();
        setArtistProfile(res.data.data);
      } catch (err) {
        console.error('Failed to load artist profile:', err);
        setArtistProfile({ fullName: user?.name || 'Artist', email: user?.email || '' });
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem('ff_lang') || 'en';
    setLang(saved);
    const onStorage = (e) => { if (e.key === 'ff_lang') setLang(e.newValue || 'en'); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (currentPath !== '/artist/dashboard/profile') return;
    const refetch = async () => {
      try {
        const res = await artistAPI.getMyProfile();
        setArtistProfile(res.data.data);
      } catch {}
    };
    const t = setTimeout(refetch, 800);
    return () => clearTimeout(t);
  }, [currentPath]);

  const handleLogout     = () => { logout(); navigate('/login'); };
  const handleBackToHome = () => { setIsProfileMenuOpen(false); navigate('/'); };

  const menuItems = [
    { path: '/artist/dashboard/overview',      label: 'Overview',           icon: LayoutDashboard },
    { path: '/artist/dashboard/artworks',      label: 'Artwork Management', icon: Image           },
    { path: '/artist/dashboard/marketplace',   label: 'Marketplace',        icon: ShoppingBag     },
    { path: '/artist/dashboard/orders',        label: 'Order Management',   icon: ShoppingCart    },
    { path: '/artist/dashboard/inquiries',     label: 'Inquiries',          icon: MessageSquare   },
    { path: '/artist/dashboard/notifications', label: 'Notifications',      icon: Bell            },
    { path: '/artist/dashboard/profile',       label: 'Profile Settings',   icon: Settings        },
  ];

  const getInitials = (name) => {
    if (!name) return 'AR';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const profilePhotoUrl =
    artistProfile?.profileImage?.url ||
    artistProfile?.profilePhoto      ||
    null;

  const activeLabel = menuItems.find(item => item.path === currentPath)?.label || 'Dashboard';

  return (
    <div className="flex min-h-screen bg-[#FAF7F2]" style={{ fontFamily: "'Libre Baskerville', serif" }}>

      {/*sidebar */}
      <aside className={`fixed top-0 left-0 h-screen bg-[#8DAA91] flex flex-col z-50 shadow-2xl
        transition-all duration-300 overflow-hidden
        ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-[72px]'}`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10 flex-shrink-0 min-w-0">
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-white text-sm font-bold truncate" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                FolkFusion
              </p>
              <p className="text-[10px] tracking-[.18em] text-[#E8F4E8] mt-0.5">ARTIST PANEL</p>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(p => !p)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 ml-auto text-white"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto px-2 space-y-0.5">
          {menuItems.map(({ path, label, icon: Icon }) => {
            const isActive = currentPath === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
                  border-l-[3px] whitespace-nowrap overflow-hidden
                  ${isActive
                    ? 'bg-[#E8F4E8]/20 text-white border-[#E8F4E8]'
                    : 'text-white/55 hover:text-white hover:bg-white/10 border-transparent'
                  }
                  ${!isSidebarOpen ? 'lg:justify-center' : ''}`}
              >
                <Icon size={17} className="flex-shrink-0" />
                {isSidebarOpen && <span className="truncate flex-1">{label}</span>}
                {isSidebarOpen && path === '/artist/dashboard/notifications' && unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#5F8B8C] text-white border border-white/30">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User strip */}
        {isSidebarOpen && artistProfile && (
          <div className="border-t border-white/10 p-3 flex-shrink-0">
            <div className="flex items-center gap-3 bg-white/8 rounded-xl px-3 py-2 mb-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/30 flex items-center justify-center bg-white/20">
                {profilePhotoUrl
                  ? <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                  : <span className="text-white text-[11px] font-bold">{getInitials(artistProfile?.fullName)}</span>
                }
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-white text-[12px] font-semibold truncate">{artistProfile?.fullName}</p>
                <p className="text-white/50 text-[10px] truncate">{artistProfile?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#E8F4E8] border border-[#E8F4E8]/30 hover:bg-[#E8F4E8]/10 transition-all text-[12px] font-medium"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0 lg:ml-[72px]'}`}>

        {/* Header — matches Super Admin style */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#E8DDD5] shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between px-6 py-[14px]">
            <div className="flex items-center gap-3">
              {/* Mobile-only menu toggle */}
              <button
                onClick={() => setIsSidebarOpen(p => !p)}
                className="p-2 rounded-lg hover:bg-[#FAF7F2] transition-colors text-[#3D3530] lg:hidden"
              >
                <Menu size={20} />
              </button>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-[13px]">
                <span className="text-[#9A8880]">Artist</span>
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

              {/* Notification bell */}
              <button
                onClick={() => navigate('/artist/dashboard/notifications')}
                className="relative p-2 rounded-full hover:bg-[#FAF7F2] transition-colors"
              >
                <Bell size={20} className="text-[#3D3530]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[#5F8B8C] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Avatar + profile dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-[#8DAA91] to-[#5F8B8C] flex items-center justify-center shadow-sm">
                    {profileLoading
                      ? <div className="w-full h-full animate-pulse bg-[#8DAA91]/50 rounded-full" />
                      : profilePhotoUrl
                        ? <img src={profilePhotoUrl} alt={artistProfile?.fullName || 'Profile'} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                        : <span className="text-white text-xs font-bold">{getInitials(artistProfile?.fullName)}</span>
                    }
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-[#8DAA91]/20 overflow-hidden z-50">
                    {/* Mini profile header */}
                    <div className="px-4 py-3 bg-gradient-to-br from-[#8DAA91]/10 to-[#5F8B8C]/10 border-b border-[#8DAA91]/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#8DAA91] to-[#5F8B8C] flex items-center justify-center">
                          {profilePhotoUrl
                            ? <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                            : <span className="text-white font-bold text-sm">{getInitials(artistProfile?.fullName)}</span>
                          }
                        </div>
                        <div className="overflow-hidden flex-1">
                          <p className="text-sm font-bold text-[#2E2E2E] truncate">{artistProfile?.fullName || 'Artist'}</p>
                          <p className="text-[10px] text-[#5F8B8C] truncate flex items-center gap-1">
                            <Mail size={9} />{artistProfile?.email || '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button onClick={handleBackToHome} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FAF7F2] transition-all group">
                        <Home size={16} className="text-[#8DAA91]" />
                        <span className="text-sm text-[#2E2E2E] font-medium">Back to Home</span>
                      </button>
                      <Link
                        to="/artist/dashboard/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FAF7F2] transition-all group"
                      >
                        <Settings size={16} className="text-[#8DAA91]" />
                        <span className="text-sm text-[#2E2E2E] font-medium">Profile Settings</span>
                      </Link>
                      <Link
                        to="/artist/dashboard/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FAF7F2] transition-all group"
                      >
                        <Camera size={16} className="text-[#8DAA91]" />
                        <span className="text-sm text-[#2E2E2E] font-medium">Change Photo</span>
                      </Link>
                      <div className="my-1 border-t border-gray-100" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-all group">
                        <LogOut size={16} className="text-red-400" />
                        <span className="text-sm text-red-400 font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6">
          <Routes>
            <Route index              element={<Navigate to="overview" replace />} />
            <Route path="overview"    element={<Overview />} />
            <Route path="artworks"    element={<ArtworkManagement />} />
            <Route path="marketplace" element={<MarketplaceManagement />} />
            <Route path="orders"      element={<OrderManagement />} />
            <Route path="inquiries"   element={<ArtistInquiries user={user} artistProfile={artistProfile} />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile"     element={<ProfileManagement />} />
          </Routes>
        </div>
      </main>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
};

export default ArtistDashboard;