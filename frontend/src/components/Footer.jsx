import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative bg-[#4A3F35] text-[#F4EDE4]"
      style={{
        backgroundImage: 'url(/images/dis1.jpg)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
        backgroundPosition: 'center',
      }}
    >
      {/* gold overlay */}
      <div className="absolute inset-0 bg-[#D4AF37] opacity-10 z-[1]" />

      {/* main content */}
      <div className="relative z-[1] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg">
                <img src="/images/logo.png" alt="FolkFusion Logo" className="w-full h-full object-cover" />
              </div>
              <div className="notranslate">
                <span className="text-xl font-bold font-heading text-[#8B4513]">
                  Folk<span className="text-[#C48A6A]">Fusion</span>
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed font-body text-black">
              Preserving and promoting Sri Lanka's rich folk art heritage through digital innovation and community empowerment.
            </p>

            {/* soical meadia links */}
            <div className="flex space-x-3">
              {[
                { href: 'https://facebook.com',  Icon: Facebook  },
                { href: 'https://instagram.com', Icon: Instagram },
                { href: 'https://twitter.com',   Icon: Twitter   },
                { href: 'https://youtube.com',   Icon: Youtube   },
              ].map(({ href, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 bg-[#5F4A3C] text-[#F4EDE4] hover:bg-[#8B4513]"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/*explore links */}
          <div>
            <h3 className="font-bold text-lg mb-4 font-heading text-[#8B4513]">
              Explore
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/historical-places', label: 'Historical Places' },
                { to: '/gallery',           label: 'Artwork Gallery'   },
                { to: '/learning',          label: 'Learning Center'   },
                { to: '/artists',           label: 'Artists'           },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm transition-colors duration-300 font-body text-black hover:text-[#4A3F35]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* services links */}
          <div>
            <h3 className="font-bold text-lg mb-4 font-heading text-[#8B4513]">
              Services
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/marketplace', label: 'Marketplace' },
                { to: '/courses',     label: 'Courses'     },
                { to: '/events',      label: 'Events'      },
                { to: '/donations',   label: 'Donations'   },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm transition-colors duration-300 font-body text-black hover:text-[#4A3F35]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 font-heading text-[#8B4513]">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="mt-1 flex-shrink-0 text-[#4A3F35]" />
                <span className="text-sm leading-relaxed font-body text-black">
                  Traditional Industry Development Department, Provincial Councils, Sri Lanka
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="flex-shrink-0 text-[#4A3F35]" />
                <a
                  href="tel:+94112345678"
                  className="text-sm transition-colors notranslate font-body text-black hover:text-black"
                >
                  +94 11 234 5678
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="flex-shrink-0 text-[#4A3F35]" />
                <a
                  href="mailto:info@folkfusion.lk"
                  className="text-sm transition-colors notranslate font-body text-black hover:text-[#8B4513]"
                >
                  info@folkfusion.lk
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="relative z-[1] border-t border-[#5F4A3C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0">
            <p className="text-sm text-center font-body text-[#8B4513]">
              <span className="notranslate">© {currentYear} FolkFusion.</span>
              {' '}All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;