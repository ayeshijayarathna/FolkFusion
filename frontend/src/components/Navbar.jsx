import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [lang, setLang]             = useState('en');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('ff_lang') || 'en';
    setLang(saved);
    const onStorage = (e) => { if (e.key === 'ff_lang') setLang(e.newValue || 'en'); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const t = NAV_LABELS[lang] || NAV_LABELS.en;
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="fixed w-full top-0 z-50 px-4 sm:px-6 lg:px-8 pt-3">
      <nav className="max-w-7xl mx-auto rounded-full border border-[#C48A6A]/20 px-6 bg-[#A67C52] backdrop-blur-xl shadow-[0_4px_30px_rgba(196,138,106,0.1)]">
        <div className="flex items-center h-16 gap-x-4">

          {/* logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 w-[168px]">
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex-shrink-0">
              <img src="/images/logo.png" alt="FolkFusion Logo" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="notranslate font-bold leading-tight truncate font-heading text-[#2E2E2E] text-[15px]">
                Folk<span className="text-white">Fusion</span>
              </div>
              <p className="text-[10px] truncate font-body text-white">
                Preserving Heritage
              </p>
            </div>
          </Link>

          {/* desktop menu */}
          <div className="hidden md:flex items-center justify-end flex-1 gap-x-4 xl:gap-x-6 min-w-0">

            {NAV_ROUTES.map(({ to, key }) => (
              <Link
                key={to}
                to={to}
                className={`notranslate font-medium transition-colors whitespace-nowrap font-body text-white hover:text-[#FFF8E1] ${lang === 'ta' ? 'text-[12px]' : 'text-[13px]'}`}
              >
                {t[key]}
              </Link>
            ))}

            {/* more dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`notranslate font-medium transition-colors flex items-center gap-1 whitespace-nowrap font-body text-white hover:text-[#FFF8E1] ${lang === 'ta' ? 'text-[12px]' : 'text-[13px]'}`}
              >
                <span>{t.more}</span>
                <ChevronDown size={14} className={`transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMoreOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl shadow-xl py-2 z-50 bg-[#FFF8E1]/85 backdrop-blur-2xl border border-[#C48A6A]/20">
                    {MORE_ROUTES.map(({ to, key }) => (
                      <Link
                        key={to}
                        to={to}
                        className="notranslate block px-4 py-2 transition-colors text-[13px] font-body text-[#2E2E2E] hover:bg-[#F4EDE4] hover:text-[#C48A6A]"
                        onClick={() => setIsMoreOpen(false)}
                      >
                        {t[key]}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* language switcher */}
            <div className="flex-shrink-0">
              <LanguageSwitcher onLangChange={setLang} />
            </div>

            {/* auth */}
            <div className="flex-shrink-0">
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-1 font-medium text-[#2E2E2E]">
                    <div className="w-9 h-9 rounded-full overflow-hidden shadow-md border-2 border-[#C48A6A]">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user?.fullName || user?.email}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white text-sm font-semibold bg-gradient-to-br from-[#C48A6A] to-[#A67C52]">${user?.email?.charAt(0).toUpperCase() || 'U'}</div>`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold bg-gradient-to-br from-[#C48A6A] to-[#A67C52]">
                          {user?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <ChevronDown size={14} />
                  </button>

                  <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 bg-[#FFF8E1]/90 backdrop-blur-2xl border border-[#C48A6A]/20">
                    <div className="px-4 py-2 border-b border-[#F4EDE4]">
                      <p className="text-sm font-medium font-body text-[#2E2E2E]">
                        {user?.fullName || user?.email}
                      </p>
                      <p className="text-xs capitalize font-body text-[#5F8B8C]">
                        {user?.role} • {user?.province}
                      </p>
                    </div>
                    <Link
                      to={user?.role === 'artist' ? '/artist/dashboard' : '/admin/dashboard'}
                      className="notranslate block px-4 py-2 text-[13px] font-body text-[#2E2E2E] hover:bg-[#F4EDE4] hover:text-[#C48A6A]"
                    >
                      {t.dashboard}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="notranslate w-full text-left px-4 py-2 text-[13px] font-body text-red-600 hover:bg-red-50"
                    >
                      {t.logout}
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`notranslate flex items-center gap-1.5 px-4 py-2 rounded-full font-medium transition-all duration-300 whitespace-nowrap font-body text-white bg-[#2E2E2E] hover:bg-[#C48A6A] ${lang === 'ta' ? 'text-[12px]' : 'text-[13px]'}`}
                >
                  <LogIn size={15} className="text-white" />
                  <span>{t.login}</span>
                </Link>
              )}
            </div>
          </div>

          {/* mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden ml-auto transition-colors text-[#2E2E2E]"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 animate-slideIn">
            <div className="flex flex-col space-y-4">
              <div className="pb-2 border-b border-[#F4EDE4]">
                <p className="text-xs text-amber-700 mb-2 font-bold tracking-widest uppercase font-body">
                  {t.language}
                </p>
                <LanguageSwitcher onLangChange={setLang} />
              </div>

              {[...NAV_ROUTES, ...MORE_ROUTES].map(({ to, key }) => (
                <Link
                  key={to}
                  to={to}
                  className="notranslate font-medium font-body text-[#2E2E2E]"
                  onClick={() => setIsOpen(false)}
                >
                  {t[key]}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3 px-2 py-3 border-y border-[#F4EDE4]">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#C48A6A]">
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt={user?.fullName || user?.email} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-[#C48A6A] to-[#A67C52]">
                          {user?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium font-body text-[#2E2E2E]">
                        {user?.fullName || user?.email}
                      </p>
                      <p className="text-xs capitalize font-body text-[#5F8B8C]">
                        {user?.role}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={user?.role === 'artist' ? '/artist/dashboard' : '/admin/dashboard'}
                    className="notranslate font-medium font-body text-[#2E2E2E]"
                    onClick={() => setIsOpen(false)}
                  >
                    {t.dashboard}
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="notranslate text-left font-medium font-body text-red-600"
                  >
                    {t.logout}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="notranslate font-medium px-4 py-2 rounded-full text-center text-white font-body bg-[#2E2E2E]"
                  onClick={() => setIsOpen(false)}
                >
                  {t.login}
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;