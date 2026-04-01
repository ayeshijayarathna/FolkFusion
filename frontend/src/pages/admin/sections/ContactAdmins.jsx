import React, { useState, useEffect } from 'react';
import {
  MessageCircle, MapPin, Phone, Search,
  Users, RefreshCw, AlertCircle, Wifi, WifiOff, Mail
} from 'lucide-react';
import { adminAPI } from '../../../services/api';
import { PROVINCES } from '../../../utils/constants';

// helpers
const formatWhatsApp = (raw = '') => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('94')) return digits;
  if (digits.startsWith('0'))  return '94' + digits.slice(1);
  return '94' + digits;
};

const openWhatsApp = (number, name) => {
  const wa = formatWhatsApp(number);
  if (!wa) return;
  const msg = encodeURIComponent(`Hello ${name}, I am contacting you through the FolkFusion admin portal.`);
  window.open(`https://wa.me/${wa}?text=${msg}`, '_blank');
};

const PROVINCE_COLORS = [
  { bg: 'from-[#8DAA91] to-[#5F8B8C]', accent: '#8DAA91', light: '#8DAA9122' },
  { bg: 'from-[#A67C52] to-[#C48A6A]', accent: '#A67C52', light: '#A67C5222' },
  { bg: 'from-[#5F8B8C] to-[#4A3F35]', accent: '#5F8B8C', light: '#5F8B8C22' },
  { bg: 'from-[#d3ab2a] to-[#C48A6A]', accent: '#d3ab2a', light: '#d3ab2a22' },
  { bg: 'from-[#C48A6A] to-[#A67C52]', accent: '#C48A6A', light: '#C48A6A22' },
  { bg: 'from-[#4A3F35] to-[#5F8B8C]', accent: '#4A3F35', light: '#4A3F3522' },
  { bg: 'from-[#8DAA91] to-[#A67C52]', accent: '#8DAA91', light: '#8DAA9122' },
  { bg: 'from-[#5F8B8C] to-[#8DAA91]', accent: '#5F8B8C', light: '#5F8B8C22' },
  { bg: 'from-[#d3ab2a] to-[#8DAA91]', accent: '#d3ab2a', light: '#d3ab2a22' },
];

const hasValue = (val) => {
  if (!val) return false;
  return String(val).trim().length > 0;
};

// admin Card
const AdminCard = ({ admin, colorIdx, index }) => {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered]   = useState(false);
  const color = PROVINCE_COLORS[colorIdx % PROVINCE_COLORS.length];

  const displayName   = hasValue(admin.fullName)      ? admin.fullName.trim()      : null;
  const waNumber      = hasValue(admin.whatsappNumber) ? admin.whatsappNumber      : null;
  const phoneNumber   = hasValue(admin.phoneNumber)    ? admin.phoneNumber          : null;
  const contactNumber = waNumber || phoneNumber;
  const hasWa         = !!waNumber;
  const hasPhone      = !!phoneNumber;
  const hasContact    = !!contactNumber;
  const email         = hasValue(admin.email)          ? admin.email                : null;
  const province      = hasValue(admin.province)       ? admin.province             : null;
  const photo         = hasValue(admin.profilePhoto)   ? admin.profilePhoto         : null;

  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : (province ? province.slice(0, 2).toUpperCase() : '??');

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
      style={{ animationDelay: `${index * 60}ms`, animation: 'fadeSlideUp 0.45s ease both' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* top gradient banner */}
      <div className={`h-20 bg-gradient-to-r ${color.bg} relative`}>
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
        <div className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full bg-white/10" />
        {province && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <MapPin size={11} className="text-white" />
            <span className="text-white text-xs font-bold tracking-wide">{province}</span>
          </div>
        )}
      </div>

      {/* avatar */}
      <div className="px-6 pb-5">
        <div className="flex items-end justify-between -mt-10 mb-3">
          <div className="relative">
            <div className={`w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br ${color.bg} transition-transform duration-300 ${hovered ? 'scale-105' : ''}`}>
              {photo && !imgError ? (
                <img src={photo} alt={displayName || 'Admin'} className="w-full h-full object-cover" onError={() => setImgError(true)} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">{initials}</div>
              )}
            </div>
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-[#8DAA91] border-2 border-white rounded-full" />
          </div>

          {/* whatsapp cta */}
          {hasWa ? (
            <button
              onClick={() => openWhatsApp(waNumber, displayName || 'Admin')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
            >
              <MessageCircle size={16} /><span>WhatsApp</span>
            </button>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4EDE4] text-[#A67C52] text-xs font-semibold">
              <WifiOff size={13} /> No WA number
            </span>
          )}
        </div>

        {/* name & details */}
        <div className="space-y-2">
          {displayName ? (
            <h3 className="text-[#4A3F35] font-bold text-lg leading-tight truncate">{displayName}</h3>
          ) : (
            <h3 className="text-[#2E2E2E]/35 font-bold text-lg leading-tight italic">Name not set</h3>
          )}
          {province && (
            <div className="flex items-center gap-1.5 text-[#2E2E2E]/50 text-sm">
              <MapPin size={13} className="flex-shrink-0" style={{ color: color.accent }} />
              <span className="truncate">{province} Province Administrator</span>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-1.5 text-[#2E2E2E]/50 text-sm">
              <Mail size={13} className="flex-shrink-0 text-[#5F8B8C]" />
              <span className="truncate font-mono text-xs tracking-wide">{email}</span>
            </div>
          )}
          {waNumber && (
            <div className="flex items-center gap-1.5 text-[#2E2E2E]/50 text-sm">
              <MessageCircle size={13} className="flex-shrink-0" style={{ color: '#25D366' }} />
              <span className="font-mono tracking-wide text-sm">{waNumber}</span>
              <span className="text-xs bg-[#25D366]/12 text-[#128C7E] px-1.5 py-0.5 rounded-full font-semibold">WA</span>
            </div>
          )}
          {phoneNumber && phoneNumber !== waNumber && (
            <div className="flex items-center gap-1.5 text-[#2E2E2E]/50 text-sm">
              <Phone size={13} className="flex-shrink-0 text-[#8DAA91]" />
              <span className="font-mono tracking-wide">{phoneNumber}</span>
            </div>
          )}
          {!hasContact && !email && (
            <div className="flex items-center gap-1.5 text-[#2E2E2E]/30 text-xs italic mt-1">
              <AlertCircle size={12} />
              <span>No contact info — admin should update their profile</span>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="mt-4 pt-4 border-t border-[#F4EDE4]">
          {hasWa ? (
            <button
              onClick={() => openWhatsApp(waNumber, displayName || 'Admin')}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-[#8DAA91]/12 text-[#4A6B4A] hover:bg-[#8DAA91]/25 hover:shadow-sm active:scale-98"
            >
              <MessageCircle size={15} />
              {displayName ? `Message ${displayName.split(' ')[0]}` : 'Send WhatsApp Message'}
            </button>
          ) : hasPhone ? (
            <a href={`tel:${phoneNumber}`}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-[#5F8B8C]/10 text-[#5F8B8C] hover:bg-[#5F8B8C]/20">
              <Phone size={15} />
              Call {displayName ? displayName.split(' ')[0] : 'Admin'}
            </a>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-[#F4EDE4] text-[#2E2E2E]/30 cursor-not-allowed">
              <WifiOff size={14} /> No contact info available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// loading skeleton
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
    <div className="h-20 bg-[#F4EDE4]" />
    <div className="px-6 pb-5">
      <div className="flex items-end justify-between -mt-10 mb-3">
        <div className="w-20 h-20 rounded-2xl bg-[#F4EDE4] border-4 border-white" />
        <div className="w-28 h-9 rounded-xl bg-[#F4EDE4]" />
      </div>
      <div className="space-y-2 mt-2">
        <div className="h-5 bg-[#F4EDE4] rounded-lg w-3/4" />
        <div className="h-4 bg-[#F4EDE4] rounded-lg w-full" />
        <div className="h-4 bg-[#F4EDE4] rounded-lg w-1/2" />
        <div className="h-4 bg-[#F4EDE4] rounded-lg w-2/3" />
      </div>
      <div className="mt-4 pt-4 border-t border-[#F4EDE4]">
        <div className="h-10 bg-[#F4EDE4] rounded-xl w-full" />
      </div>
    </div>
  </div>
);

// main component
const ContactAdmins = () => {
  const [admins,     setAdmins]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdmins = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await adminAPI.getAllAdmins();
      if (res.data.success) {

        const sorted = [...(res.data.data || [])].sort((a, b) => {
          const ai = PROVINCES.indexOf(a.province);
          const bi = PROVINCES.indexOf(b.province);
          if (ai === -1 && bi === -1) return (a.province || '').localeCompare(b.province || '');
          if (ai === -1) return 1;
          if (bi === -1) return -1;
          return ai - bi;
        });
        setAdmins(sorted);
      }
    } catch (err) {
      setError('Could not load admin contacts. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const filtered = admins.filter(a => {
    const q = search.toLowerCase();
    return (
      (a.fullName       || '').toLowerCase().includes(q) ||
      (a.province       || '').toLowerCase().includes(q) ||
      (a.email          || '').toLowerCase().includes(q) ||
      (a.whatsappNumber || '').includes(q) ||
      (a.phoneNumber    || '').includes(q)
    );
  });

  const withWa    = admins.filter(a => hasValue(a.whatsappNumber)).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#4A3F35]">Contact Admins</h1>
          <p className="text-[#2E2E2E]/55 mt-1">Connect with provincial administrators via WhatsApp or phone</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#8DAA91]/12 rounded-xl border border-[#8DAA91]/25">
            <Users size={15} className="text-[#8DAA91]" />
            <span className="text-sm font-bold text-[#4A3F35]">{admins.length} Admin{admins.length !== 1 ? 's' : ''}</span>
          </div>
          {withWa > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#25D366]/10 rounded-xl border border-[#25D366]/20">
              <MessageCircle size={13} style={{ color: '#25D366' }} />
              <span className="text-xs font-bold" style={{ color: '#128C7E' }}>{withWa} on WhatsApp</span>
            </div>
          )}
          <button
            onClick={() => fetchAdmins(true)}
            disabled={refreshing}
            className="p-2.5 bg-white border border-[#8DAA91]/25 rounded-xl text-[#8DAA91] hover:bg-[#8DAA91]/10 transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8DAA91]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, province, email or phone number…"
          className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-[#8DAA91]/20 rounded-2xl focus:outline-none focus:border-[#8DAA91] text-[#4A3F35] placeholder-[#2E2E2E]/35 shadow-sm text-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2E2E2E]/35 hover:text-[#4A3F35] text-lg leading-none">×</button>
        )}
      </div>

      {/* error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => fetchAdmins()} className="ml-auto px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors">Retry</button>
        </div>
      )}

      {/* loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-[#F4EDE4] rounded-2xl flex items-center justify-center mb-4">
            {search ? <Search size={32} className="text-[#A67C52]/50" /> : <Users size={32} className="text-[#A67C52]/50" />}
          </div>
          <p className="text-[#4A3F35] font-semibold text-lg">{search ? 'No admins match your search' : 'No admins found'}</p>
          <p className="text-[#2E2E2E]/45 text-sm mt-1">{search ? 'Try a different search term' : 'Admin accounts will appear here once created'}</p>
          {search && (
            <button onClick={() => setSearch('')} className="mt-4 px-5 py-2 bg-[#8DAA91]/15 text-[#4A6B4A] rounded-xl text-sm font-semibold hover:bg-[#8DAA91]/25 transition-colors">Clear search</button>
          )}
        </div>
      )}

      {/* cards */}
      {!loading && !error && filtered.length > 0 && (
        <>
          {search && (
            <p className="text-sm text-[#2E2E2E]/45">
              Showing <span className="font-semibold text-[#4A3F35]">{filtered.length}</span> result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((admin, i) => (
              <AdminCard key={admin._id} admin={admin} colorIdx={i} index={i} />
            ))}
          </div>
        </>
      )}

      {/* footer note */}
      {!loading && admins.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-[#FFF8E1] border border-[#d3ab2a]/25 rounded-2xl">
          <Wifi size={16} className="text-[#d3ab2a] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#4A3F35]/65 leading-relaxed">
            Contact details are pulled directly from each admin's profile. If a number is missing, the admin needs to update their profile with their WhatsApp or phone number.
          </p>
        </div>
      )}
    </div>
  );
};

export default ContactAdmins;