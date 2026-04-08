import { useState } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  RiDashboardLine, RiShieldUserLine, RiSettings3Line,
  RiMenuLine, RiCloseLine, RiLogoutBoxRLine,
  RiArrowRightSLine, RiBookOpenLine, RiStarLine,
  RiFileLine, RiMessage2Line, RiGroupLine,
} from 'react-icons/ri';
import { useSuperAdminAuth } from '../../context/Superadminauthcontext';
import Overview      from './sections/Overview';
import AdminAccounts from './sections/AdminAccounts';
import SASettings    from './sections/SASettings';
import LearningContent from './sections/LearningContent';
import Reviews         from './sections/Reviews';
import LearningUsers   from './sections/LearningUsers';


const NAV = [
  { to: 'overview',  label: 'Overview',        Icon: RiDashboardLine  },
  { to: 'admins',    label: 'Admin Accounts',   Icon: RiShieldUserLine },
  { to: 'learning',  label: 'Learning Content', Icon: RiBookOpenLine   },
  { to: 'reviews',   label: 'Reviews',          Icon: RiStarLine       },
  { to: 'users',     label: 'Learning Users',   Icon: RiGroupLine      },
  { to: 'settings',  label: 'Settings',         Icon: RiSettings3Line  },
];

export default function SuperAdminDashboard() {
  const { superAdmin, logout } = useSuperAdminAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(true);

  const currentLabel = NAV.find(n =>
    location.pathname.includes(`/super-admin/dashboard/${n.to}`)
  )?.label || 'Dashboard';

  const initials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SA';

  return (
    <div className="flex min-h-screen bg-[#FAF7F2]" style={{ fontFamily: "'Libre Baskerville', serif" }}>

      {/* sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#3D3530] flex flex-col z-50 shadow-2xl transition-all duration-300 overflow-hidden
          ${open ? 'w-64' : 'w-0 lg:w-[72px]'}`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10 flex-shrink-0 min-w-0">
          {open && (
            <div className="overflow-hidden">
              <p className="text-white text-sm font-bold truncate" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                FolkFusion
              </p>
              <p className="text-[10px] tracking-[.18em] text-[#C97B5A] mt-0.5">SUPER ADMIN</p>
            </div>
          )}
          <button
            onClick={() => setOpen(p => !p)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 ml-auto text-white"
          >
            {open ? <RiCloseLine size={18} /> : <RiMenuLine size={18} />}
          </button>
        </div>

        {/* nav links */}
        <nav className="flex-1 py-3 overflow-y-auto px-2 space-y-0.5">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
                border-l-[3px] whitespace-nowrap overflow-hidden
                ${isActive
                  ? 'bg-[#C97B5A]/20 text-white border-[#C97B5A]'
                  : 'text-white/55 hover:text-white hover:bg-white/10 border-transparent'
                }
                ${!open ? 'lg:justify-center' : ''}`
              }
            >
              <Icon size={17} className="flex-shrink-0" />
              {open && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* user strip */}
        {open && (
          <div className="border-t border-white/10 p-3 flex-shrink-0">
            <div className="flex items-center gap-3 bg-white/8 rounded-xl px-3 py-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C97B5A] to-[#7A9E8E] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[11px] font-bold">{initials(superAdmin?.fullName)}</span>
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-white text-[12px] font-semibold truncate">{superAdmin?.fullName || 'Super Admin'}</p>
                <p className="text-white/50 text-[10px] truncate">{superAdmin?.email}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/system/super-admin'); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#C97B5A] border border-[#C97B5A]/30 hover:bg-[#C97B5A]/10 transition-all text-[12px] font-medium"
            >
              <RiLogoutBoxRLine size={14} />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/*main */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${open ? 'ml-64' : 'ml-0 lg:ml-[72px]'}`}>

        {/* header */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#E8DDD5] shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between px-6 py-[14px]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen(p => !p)}
                className="p-2 rounded-lg hover:bg-[#FAF7F2] transition-colors text-[#3D3530] lg:hidden"
              >
                <RiMenuLine size={20} />
              </button>
              <div className="flex items-center gap-2 text-[13px]">
                <span className="text-[#9A8880]">Super Admin</span>
                <RiArrowRightSLine size={14} className="text-[#9A8880]" />
                <span className="text-[#3D3530] font-semibold" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 13 }}>
                  {currentLabel}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C97B5A] to-[#7A9E8E] flex items-center justify-center">
              <span className="text-white text-xs font-bold">{initials(superAdmin?.fullName)}</span>
            </div>
          </div>
        </header>

        {/* page */}
        <div className="flex-1 p-6">
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview"  element={<Overview />} />
            <Route path="admins"    element={<AdminAccounts />} />
            <Route path="settings"  element={<SASettings />} />
            <Route path="learning"  element={<LearningContent />} />
            <Route path="reviews"   element={<Reviews />} />
            <Route path="users"     element={<LearningUsers />} />
          </Routes>
        </div>
      </main>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}