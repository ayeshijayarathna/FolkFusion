import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

const NAV_LABELS = {
  en: {
    home: 'Home', historical: 'Historical Places', courses: 'Courses',
    learning: 'Learning', artists: 'Artists', marketplace: 'Marketplace',
    more: 'More',
    news: 'News', events: 'Events', gallery: 'Gallery',
    donations: 'Donations', partnership: 'Partnership',
    privacy: 'Privacy Policy', terms: 'Terms & Conditions',
    login: 'Login', dashboard: 'Dashboard', logout: 'Logout',
    language: 'Language',
  },
  si: {
    home: 'මුල් පිටුව', historical: 'ඓතිහාසික ස්ථාන', courses: 'පාඨමාලා',
    learning: 'ඉගෙනීම', artists: 'කලාකරුවන්', marketplace: 'වෙළඳපොළ',
    more: 'තව',
    news: 'ප්‍රවෘත්ති', events: 'සිදුවීම්', gallery: 'ගැලරිය',
    donations: 'පරිත්‍යාග', partnership: 'හවුල්කාරිත්වය',
    privacy: 'රහස්‍යතා ප්‍රතිපත්තිය', terms: 'නියම සහ කොන්දේසි',
    login: 'පිවිසෙන්න', dashboard: 'උපකරණ පුවරුව', logout: 'වරන්',
    language: 'භාෂාව',
  },
  ta: {
    home: 'முகப்பு', historical: 'வரலாற்று இடங்கள்', courses: 'படிப்புகள்',
    learning: 'கற்றல்', artists: 'கலைஞர்கள்', marketplace: 'சந்தை',
    more: 'மேலும்',
    news: 'செய்திகள்', events: 'நிகழ்வுகள்', gallery: 'கேலரி',
    donations: 'நன்கொடை', partnership: 'கூட்டாண்மை',
    privacy: 'தனியுரிமை', terms: 'விதிமுறைகள்',
    login: 'உள்நுழை', dashboard: 'கட்டுப்பலகை', logout: 'வெளியேறு',
    language: 'மொழி',
  },
};

const NAV_ROUTES = [
  { to: '/',                  key: 'home'        },
  { to: '/historical-places', key: 'historical'  },
  { to: '/courses',           key: 'courses'     },
  { to: '/learning',          key: 'learning'    },
  { to: '/artists',           key: 'artists'     },
  { to: '/marketplace',       key: 'marketplace' },
];

const MORE_ROUTES = [
  { to: '/news',                 key: 'news'        },
  { to: '/events',               key: 'events'      },
  { to: '/gallery',              key: 'gallery'     },
  { to: '/donations',            key: 'donations'   },
  { to: '/partnership',          key: 'partnership' },
  { to: '/privacy-policy',       key: 'privacy'     },
  { to: '/terms-and-conditions', key: 'terms'       },
];

const Navbar = () => {
  const [isOpen, setIsOpen]         = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [moreExpanded, setMoreExpanded] = useState(false); 
  const [lang, setLang]             = useState('en');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  useEffect(() => {
    const saved = localStorage.getItem('ff_lang') || 'en';
    setLang(saved);
    const onStorage = (e) => { if (e.key === 'ff_lang') setLang(e.newValue || 'en'); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const t = NAV_LABELS[lang] || NAV_LABELS.en;
  const handleLogout = () => { logout(); navigate('/'); setIsOpen(false); };

  return (
    <div className="fixed w-full top-0 z-50 px-4 sm:px-6 lg:px-8 pt-3">
      <nav className="max-w-7xl mx-auto rounded-full border border-[#C48A6A]/20 px-6 bg-[#A67C52] backdrop-blur-xl shadow-[0_4px_30px_rgba(196,138,106,0.1)]">
        <div className="flex items-center h-16 gap-x-4">

          {/* logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 w-[168px]">
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex-shrink-0">
              <img src="/images/logo.png" alt="FolkFusion Logo" className="w-full h-full object-cover"/>
            </div>
            <div className="min-w-0">
              <div className="notranslate font-bold leading-tight truncate font-heading text-[#2E2E2E] text-[15px]">
                Folk<span className="text-white">Fusion</span>
              </div>
              <p className="text-[10px] truncate font-body text-white">Preserving Heritage</p>
            </div>
          </Link>

          {/* desktop menu */}
          <div className="hidden md:flex items-center justify-end flex-1 gap-x-4 xl:gap-x-6 min-w-0">
            {NAV_ROUTES.map(({ to, key }) => (
              <Link key={to} to={to}
                className={`notranslate font-medium transition-colors whitespace-nowrap font-body text-white hover:text-[#FFF8E1] ${lang === 'ta' ? 'text-[12px]' : 'text-[13px]'}`}>
                {t[key]}
              </Link>
            ))}

            {/* more dropdown */}
            <div className="relative flex-shrink-0">
              <button onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`notranslate font-medium transition-colors flex items-center gap-1 whitespace-nowrap font-body text-white hover:text-[#FFF8E1] ${lang === 'ta' ? 'text-[12px]' : 'text-[13px]'}`}>
                <span>{t.more}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`}/>
              </button>
              {isMoreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMoreOpen(false)}/>
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl shadow-xl py-2 z-50 bg-[#FFF8E1]/85 backdrop-blur-2xl border border-[#C48A6A]/20">
                    {MORE_ROUTES.map(({ to, key }) => (
                      <Link key={to} to={to}
                        className="notranslate block px-4 py-2 transition-colors text-[13px] font-body text-[#2E2E2E] hover:bg-[#F4EDE4] hover:text-[#C48A6A]"
                        onClick={() => setIsMoreOpen(false)}>
                        {t[key]}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex-shrink-0">
              <LanguageSwitcher onLangChange={setLang}/>
            </div>

            {/* auth */}
            <div className="flex-shrink-0">
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-1 font-medium text-[#2E2E2E]">
                    <div className="w-9 h-9 rounded-full overflow-hidden shadow-md border-2 border-[#C48A6A]">
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt={user?.fullName || user?.email} className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white text-sm font-semibold bg-gradient-to-br from-[#C48A6A] to-[#A67C52]">${user?.email?.charAt(0).toUpperCase() || 'U'}</div>`;
                          }}/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold bg-gradient-to-br from-[#C48A6A] to-[#A67C52]">
                          {user?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <ChevronDown size={14}/>
                  </button>
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 bg-[#FFF8E1]/90 backdrop-blur-2xl border border-[#C48A6A]/20">
                    <div className="px-4 py-2 border-b border-[#F4EDE4]">
                      <p className="text-sm font-medium font-body text-[#2E2E2E]">{user?.fullName || user?.email}</p>
                      <p className="text-xs capitalize font-body text-[#5F8B8C]">{user?.role} • {user?.province}</p>
                    </div>
                    <Link to={user?.role === 'artist' ? '/artist/dashboard' : '/admin/dashboard'}
                      className="notranslate block px-4 py-2 text-[13px] font-body text-[#2E2E2E] hover:bg-[#F4EDE4] hover:text-[#C48A6A]">
                      {t.dashboard}
                    </Link>
                    <button onClick={handleLogout}
                      className="notranslate w-full text-left px-4 py-2 text-[13px] font-body text-red-600 hover:bg-red-50">
                      {t.logout}
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login"
                  className={`notranslate flex items-center gap-1.5 px-4 py-2 rounded-full font-medium transition-all duration-300 whitespace-nowrap font-body text-white bg-[#2E2E2E] hover:bg-[#C48A6A] ${lang === 'ta' ? 'text-[12px]' : 'text-[13px]'}`}>
                  <LogIn size={15} className="text-white"/>
                  <span>{t.login}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile right side */}
          <div className="md:hidden ml-auto flex items-center gap-2">
            {/* Mobile login & avatar */}
            {isAuthenticated ? (
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#C48A6A] flex-shrink-0">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="" className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold bg-gradient-to-br from-[#C48A6A] to-[#A67C52]">
                    {user?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-body font-medium text-white bg-[#2E2E2E] hover:bg-[#C48A6A] transition-colors">
                <LogIn size={13}/>
                <span>{t.login}</span>
              </Link>
            )}
            {/* hamburger */}
            <button onClick={() => setIsOpen(!isOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[#2E2E2E]/20 hover:bg-[#2E2E2E]/30 transition-colors text-[#2E2E2E]">
              {isOpen ? <X size={18}/> : <Menu size={18}/>}
            </button>
          </div>
        </div>
      </nav>

      {/*mobile menu overlay*/}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[76px] z-40 flex flex-col">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}/>

          {/* menu panel */}
          <div className="relative z-10 mx-4 mt-2 bg-[#FFF8F0] rounded-3xl shadow-2xl border border-[#C48A6A]/20 overflow-hidden max-h-[calc(100vh-100px)] flex flex-col">

            {/* User info strip (if logged in) */}
            {isAuthenticated && (
              <div className="px-5 py-4 bg-[#A67C52] flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/40 flex-shrink-0">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="" className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-[#C48A6A] to-[#8B6340]">
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold font-body text-white truncate">{user?.fullName || user?.email}</p>
                  <p className="text-[11px] font-body text-white/70 capitalize">{user?.role} • {user?.province}</p>
                </div>
                <Link to={user?.role === 'artist' ? '/artist/dashboard' : '/admin/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-body font-medium transition-colors flex-shrink-0">
                  {t.dashboard}
                </Link>
              </div>
            )}

            {/* Scrollable nav links */}
            <div className="overflow-y-auto flex-1 px-4 py-4">

              {/* Main nav */}
              <div className="space-y-1 mb-4">
                {NAV_ROUTES.map(({ to, key }) => (
                  <Link key={to} to={to}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-2xl font-body font-medium text-[#2E2E2E] hover:bg-[#C48A6A]/10 hover:text-[#C48A6A] transition-colors ${
                      location.pathname === to ? 'bg-[#C48A6A]/15 text-[#C48A6A]' : ''
                    }`}>
                    {t[key]}
                  </Link>
                ))}
              </div>

              {/* More section accordion */}
              <div className="mb-4">
                <button
                  onClick={() => setMoreExpanded(!moreExpanded)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-2xl font-body font-medium text-[#2E2E2E] hover:bg-[#C48A6A]/10 transition-colors">
                  <span>{t.more}</span>
                  <ChevronDown size={16} className={`text-[#C48A6A] transition-transform duration-200 ${moreExpanded ? 'rotate-180' : ''}`}/>
                </button>
                {moreExpanded && (
                  <div className="mt-1 ml-3 space-y-1 border-l-2 border-[#C48A6A]/20 pl-3">
                    {MORE_ROUTES.map(({ to, key }) => (
                      <Link key={to} to={to}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center px-3 py-2.5 rounded-xl font-body text-sm text-[#5C4A3A] hover:bg-[#C48A6A]/10 hover:text-[#C48A6A] transition-colors">
                        {t[key]}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Language switcher */}
              <div className="px-4 py-3 rounded-2xl bg-[#F5EDE4] border border-[#C48A6A]/15 mb-4">
                <p className="text-[10px] font-bold tracking-widest uppercase font-body text-[#8B7355] mb-2">
                  {t.language}
                </p>
                <LanguageSwitcher onLangChange={setLang}/>
              </div>

              {/* Auth actions */}
              {isAuthenticated ? (
                <button onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-body font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200">
                  {t.logout}
                </button>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-body font-medium text-white bg-[#2E2E2E] hover:bg-[#C48A6A] transition-colors">
                  <LogIn size={16}/>
                  {t.login}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;