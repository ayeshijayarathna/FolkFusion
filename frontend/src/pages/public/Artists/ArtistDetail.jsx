import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft, HiShare, HiClipboardCopy, HiCheck,
  HiLocationMarker, HiPhone, HiMail, HiGlobe,
} from 'react-icons/hi';
import {
  HiMapPin,
} from 'react-icons/hi2';
import {
  MdOutlineWorkspacePremium, MdOutlineCelebration,
} from 'react-icons/md';
import {
  FaFacebookF, FaInstagram, FaTwitter,
} from 'react-icons/fa';
import {
  BsImages, BsPalette2,
} from 'react-icons/bs';
import { RiAwardLine } from 'react-icons/ri';
import axios from 'axios';

const DiamondDivider = ({ className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="flex-1 h-px bg-[#A67C52]/25" />
    <div className="flex-1 h-px bg-[#A67C52]/25" />
  </div>
);

/* helper functions*/
const getInitials = (name) => {
  if (!name) return '?';
  const names = name.split(' ');
  return names.length >= 2 ? names[0][0] + names[1][0] : name[0];
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const getImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  return img.url || null;
};

/*Side Info Card  */
const InfoCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl border border-[#E8D5BC] overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[#E8D5BC] bg-[#FBF6F0]">
      {Icon && <Icon size={16} className="text-[#A67C52]" />}
      <h3
        className="text-sm font-bold text-[#4A3F35] tracking-widest uppercase"
        style={{ fontFamily: 'Libre Baskerville, serif' }}
      >
        {title}
      </h3>
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

/*Section Card  */
const SectionCard = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`bg-white rounded-3xl border border-[#E8D5BC] overflow-hidden ${className}`}>
    {title && (
      <div className="px-8 pt-7 pb-5">
        <div className="flex items-center gap-3 mb-2">
          {Icon && <Icon size={20} className="text-[#A67C52]" />}
          <h2
            className="text-xl font-semibold text-[#4A3F35] tracking-wide"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            {title}
          </h2>
        </div>
        <DiamondDivider className="mt-1" />
      </div>
    )}
    <div className={title ? 'px-8 pb-8' : 'p-8'}>{children}</div>
  </div>
);

/*Stat Pill */
const StatPill = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col items-center bg-[#FBF6F0] border border-[#E8D5BC] rounded-2xl px-5 py-4 min-w-[90px]">
    <Icon size={20} className="text-[#A67C52] mb-1.5" />
    <span
      className="text-2xl font-bold text-[#4A3F35] leading-none mb-1"
      style={{ fontFamily: 'Libre Baskerville, serif' }}
    >
      {value}
    </span>
    <span className="text-[10px] text-[#A67C52] tracking-widest uppercase font-semibold">{label}</span>
  </div>
);

/*main ArtistDetail Component */
const ArtistDetail = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [artist, setArtist]           = useState(null);
  const [artworks, setArtworks]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied]           = useState(false);

  /*fetch artist detail*/
  useEffect(() => {
    fetchArtistDetail();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchArtistDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/artists/${id}`);
      if (response.data.success) {
        setArtist(response.data.data);
        if (response.data.data.artworks) setArtworks(response.data.data.artworks);
      }
    } catch (error) {
      console.error('Error fetching artist:', error);
    } finally {
      setLoading(false);
    }
  };

  /*share */
  const handleShare = (platform) => {
    const url   = window.location.href;
    const title = artist.fullName;
    const text  = artist.bio;
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      default:
        if (navigator.share) navigator.share({ title, text, url }).catch(() => {});
    }
    setShowShareMenu(false);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EDE4]">
        <div className="flex flex-col items-center gap-4">
          <LotusMotif className="w-16 h-8 text-[#A67C52] animate-pulse" />
          <div className="w-10 h-10 border-2 border-[#A67C52]/30 border-t-[#A67C52] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  /*not found */
  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EDE4]">
        <div className="text-center max-w-md mx-auto px-6">
          <BsPalette2 size={56} className="mx-auto text-[#A67C52]/50 mb-5" />
          <h2
            className="text-2xl text-[#4A3F35] mb-3"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            Artist Not Found
          </h2>
          <p className="text-[#4A3F35]/60 mb-6" style={{ fontFamily: 'Libre Baskerville, serif' }}>
            The artist profile you're looking for doesn't exist or may have been removed.
          </p>
          <Link
            to="/artists"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4A3F35] text-[#F4EDE4]
              rounded-full text-sm font-bold tracking-wide hover:bg-[#A67C52] transition-colors"
          >
            <HiArrowLeft size={16} /> Back to Artists
          </Link>
        </div>
      </div>
    );
  }

  const profileSrc = artist.profileImage?.url || artist.profilePhoto;

  return (
    <div className="min-h-screen bg-[#F4EDE4]">

      {/* hero */}
      <section
        className="relative pt-28 pb-20 overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #FBF5EC 0%, #F4EDE4 40%, #EDE0CE 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234A3F35'%3E%3Ccircle cx='60' cy='60' r='3'/%3E%3Ccircle cx='60' cy='60' r='18' fill='none' stroke='%234A3F35' stroke-width='1'/%3E%3Ccircle cx='60' cy='60' r='32' fill='none' stroke='%234A3F35' stroke-width='0.5'/%3E%3Cpath d='M60 28 L64 44 L60 40 L56 44Z' /%3E%3Cpath d='M60 92 L64 76 L60 80 L56 76Z' /%3E%3Cpath d='M28 60 L44 56 L40 60 L44 64Z' /%3E%3Cpath d='M92 60 L76 56 L80 60 L76 64Z' /%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px',
          }}
        />

        {/* decorative top border line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />

        {/* Corner lotus motifs */}
        <LotusMotif className="absolute top-8 left-8 w-20 h-10 text-[#A67C52]" />
        <LotusMotif className="absolute top-8 right-8 w-20 h-10 text-[#A67C52] scale-x-[-1]" />

        <div className="relative max-w-6xl mx-auto px-6">
          {/* back button */}
          <button
            onClick={() => navigate('/artists')}
            className="flex items-center gap-2 text-[#4A3F35]/70 hover:text-[#A67C52]
              transition-colors text-sm font-semibold tracking-wide mb-10
              border border-[#A67C52]/25 rounded-full px-4 py-2 bg-white/60
              hover:bg-white/80 backdrop-blur-sm"
          >
            <HiArrowLeft size={15} />
            Back to Artists
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">

            {/*portrait Column */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start">

              {/* ellipse portrait frame */}
              <div className="relative mb-5">
                <div
                  className="w-64 h-80 mx-auto border-4 border-[#D4AF37]/50 shadow-2xl overflow-hidden bg-[#EDE0CE]"
                  style={{ borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%' }}
                >
                  {profileSrc ? (
                    <img
                      src={profileSrc}
                      alt={artist.fullName}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C4956A] to-[#A67C52]">
                      <span
                        className="text-7xl font-bold text-white/90"
                        style={{ fontFamily: 'Libre Baskerville, serif' }}
                      >
                        {getInitials(artist.fullName)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Golden accent dot */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                  <span className="w-3 h-3 rounded-full bg-[#A67C52] -mt-0.5" />
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                </div>
              </div>
            </div>

            {/* info column*/}
            <div className="md:col-span-8 pt-2">

              {/* Name */}
              <div className="mb-1">
                <p
                  className="text-[#A67C52] text-xs font-bold tracking-[0.3em] uppercase mb-2"
                  style={{ fontFamily: 'Libre Baskerville, serif' }}
                >
                  Folk Artist · Sri Lanka
                </p>
                <h1
                  className="text-5xl md:text-6xl font-light text-[#4A3F35] leading-none mb-4"
                  style={{ fontFamily: 'Libre Baskerville, serif' }}
                >
                  {artist.fullName}
                </h1>
              </div>

              <DiamondDivider className="mb-5" />

              {/* Specialization tags */}
              {artist.specialization?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {artist.specialization.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-1.5 bg-[#A67C52]/10 text-[#A67C52] border border-[#A67C52]/30
                        rounded-full text-xs font-bold tracking-wide"
                      style={{ fontFamily: 'Libre Baskerville, serif' }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}

              {/* location */}
              {artist.user?.province && (
                <div className="flex items-center gap-2 text-[#4A3F35]/60 mb-5 text-sm">
                  <HiMapPin size={14} className="text-[#5F8B8C]" />
                  <span style={{ fontFamily: 'Libre Baskerville, serif' }}>
                    {[artist.address?.city, artist.address?.district, `${artist.user.province} Province`]
                      .filter(Boolean).join(', ')}
                  </span>
                </div>
              )}

              {/* bio excerpt */}
              {artist.bio && (
                <p
                  className="text-[#4A3F35]/70 leading-relaxed italic text-base mb-7 max-w-xl
                    border-l-2 border-[#D4AF37]/50 pl-4"
                  style={{ fontFamily: 'Libre Baskerville, serif' }}
                >
                  "{artist.bio.slice(0, 180)}{artist.bio.length > 180 ? '…' : ''}"
                </p>
              )}

              {/* share button */}
              <div className="relative inline-block">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#4A3F35] text-[#F4EDE4]
                    rounded-full text-sm font-bold tracking-wide
                    hover:bg-[#A67C52] transition-all duration-300"
                >
                  <HiShare size={15} />
                  Share Profile
                </button>

                {showShareMenu && (
                  <div className="absolute top-full mt-2 left-0 w-48 bg-white rounded-2xl
                    shadow-xl border border-[#E8D5BC] z-50 overflow-hidden">
                    <button
                      onClick={() => handleShare('copy')}
                      className="w-full flex items-center gap-3 px-4 py-3
                        hover:bg-[#FBF6F0] text-[#4A3F35] text-sm transition-colors"
                    >
                      {copied
                        ? <HiCheck size={15} className="text-[#5F8B8C]" />
                        : <HiClipboardCopy size={15} className="text-[#A67C52]" />}
                      {copied ? 'Link Copied!' : 'Copy Link'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 48" className="w-full h-12 text-[#F4EDE4]" fill="currentColor">
            <path d="M0,32 C360,0 1080,64 1440,32 L1440,48 L0,48Z" />
          </svg>
        </div>
      </section>

      {/* main content*/}
      <section className="py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-2 space-y-7">

              {/* About */}
              {artist.bio && (
                <SectionCard title="About the Artist" icon={BsPalette2}>
                  <p
                    className="text-[#4A3F35]/80 leading-relaxed whitespace-pre-line text-base"
                    style={{ fontFamily: 'Libre Baskerville, serif' }}
                  >
                    {artist.bio}
                  </p>
                </SectionCard>
              )}

              {/* Certification */}
              {artist.certification?.hasCertification && (
                <SectionCard title="Certification" icon={RiAwardLine}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40
                      flex items-center justify-center flex-shrink-0">
                      <RiAwardLine size={22} className="text-[#D4AF37]" />
                    </div>
                    <p
                      className="text-[#4A3F35]/80 leading-relaxed pt-1"
                      style={{ fontFamily: 'Libre Baskerville, serif' }}
                    >
                      {artist.certification.certificationDetails || 'Certified artisan'}
                    </p>
                  </div>
                </SectionCard>
              )}

              {/* artworks */}
              {artworks.length > 0 && (
                <SectionCard title="Artwork Gallery" icon={BsImages}>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {artworks.map((artwork) => {
                      const primaryImg = artwork.images?.find(img => img.isPrimary) || artwork.images?.[0];
                      const imgUrl = getImageUrl(primaryImg);
                      return (
                        <div
                          key={artwork._id}
                          className="group relative aspect-square rounded-2xl overflow-hidden
                            border border-[#E8D5BC] shadow-sm hover:shadow-lg transition-all duration-300"
                        >
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={artwork.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={e => {
                                e.target.style.display = 'none';
                                e.target.parentElement.style.background =
                                  'linear-gradient(135deg, #C4956A 0%, #A67C52 100%)';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#C4956A] to-[#A67C52]
                              flex items-center justify-center">
                              <BsPalette2 size={28} className="text-white/80" />
                            </div>
                          )}

                          {/* hover caption*/}
                          <div
                            className="absolute inset-0 bg-[#A67C52]/70 opacity-0
                              group-hover:opacity-100 transition-opacity duration-300
                              flex items-end p-3"
                          >
                            <p className="text-white text-xs font-semibold line-clamp-2 leading-tight"
                              style={{ fontFamily: 'Libre Baskerville, serif' }}>
                              {artwork.title}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}
            </div>

            {/* right side */}
            <div className="lg:col-span-1 space-y-5">

              {/* personal info */}
              <InfoCard title="Personal Info" icon={MdOutlineCelebration}>
                <dl className="space-y-3 text-sm">
                  {artist.gender && (
                    <div className="flex justify-between items-center py-1 border-b border-[#F0E6D6]">
                      <dt className="text-[#4A3F35]/50 font-medium">Gender</dt>
                      <dd
                        className="text-[#4A3F35] font-semibold capitalize"
                        style={{ fontFamily: 'Libre Baskerville, serif' }}
                      >
                        {artist.gender}
                      </dd>
                    </div>
                  )}
                  {artist.dateOfBirth && (
                    <div className="flex justify-between items-center py-1 border-b border-[#F0E6D6]">
                      <dt className="text-[#4A3F35]/50 font-medium">Age</dt>
                      <dd
                        className="text-[#4A3F35] font-semibold"
                        style={{ fontFamily: 'Libre Baskerville, serif' }}
                      >
                        {calculateAge(artist.dateOfBirth)} years
                      </dd>
                    </div>
                  )}
                  {artist.yearsOfExperience > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <dt className="text-[#4A3F35]/50 font-medium">Experience</dt>
                      <dd
                        className="text-[#4A3F35] font-semibold"
                        style={{ fontFamily: 'Libre Baskerville, serif' }}
                      >
                        {artist.yearsOfExperience} years
                      </dd>
                    </div>
                  )}
                </dl>
              </InfoCard>

              {/* Contact */}
              <InfoCard title="Contact" icon={HiMail}>
                <div className="space-y-3 text-sm">
                  {artist.phoneNumber && (
                    <a
                      href={`tel:${artist.phoneNumber}`}
                      className="flex items-center gap-3 text-[#4A3F35]/70 hover:text-[#A67C52]
                        transition-colors group"
                    >
                      <span className="w-8 h-8 rounded-full bg-[#5F8B8C]/10 flex items-center
                        justify-center flex-shrink-0 group-hover:bg-[#A67C52]/10 transition-colors">
                        <HiPhone size={14} className="text-[#5F8B8C] group-hover:text-[#A67C52]" />
                      </span>
                      <span style={{ fontFamily: 'Libre Baskerville, serif' }}>
                        {artist.phoneNumber}
                      </span>
                    </a>
                  )}
                  {artist.user?.email && (
                    <a
                      href={`mailto:${artist.user.email}`}
                      className="flex items-center gap-3 text-[#4A3F35]/70 hover:text-[#A67C52]
                        transition-colors group"
                    >
                      <span className="w-8 h-8 rounded-full bg-[#5F8B8C]/10 flex items-center
                        justify-center flex-shrink-0 group-hover:bg-[#A67C52]/10 transition-colors">
                        <HiMail size={14} className="text-[#5F8B8C] group-hover:text-[#A67C52]" />
                      </span>
                      <span
                        className="break-all"
                        style={{ fontFamily: 'Libre Baskerville, serif' }}
                      >
                        {artist.user.email}
                      </span>
                    </a>
                  )}
                </div>
              </InfoCard>

              {/* Location */}
              {artist.address && (artist.address.city || artist.address.district) && (
                <InfoCard title="Location" icon={HiLocationMarker}>
                  <div className="space-y-1.5 text-sm" style={{ fontFamily: 'Libre Baskerville, serif' }}>
                    {artist.address.city && (
                      <p className="text-[#4A3F35]/80">{artist.address.city}</p>
                    )}
                    {artist.address.district && (
                      <p className="text-[#4A3F35]/80">{artist.address.district}</p>
                    )}
                    {artist.user?.province && (
                      <p className="font-bold text-[#A67C52] tracking-wide">
                        {artist.user.province} Province
                      </p>
                    )}
                  </div>
                </InfoCard>
              )}

              {/* Social Media */}
              {artist.socialMedia &&
                (artist.socialMedia.facebook || artist.socialMedia.instagram ||
                  artist.socialMedia.twitter || artist.socialMedia.website) && (
                  <InfoCard title="Social Media" icon={HiGlobe}>
                    <div className="space-y-2 text-sm">
                      {artist.socialMedia.facebook && (
                        <a
                          href={artist.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-[#4A3F35]/70 hover:text-[#A67C52]
                            transition-colors group"
                        >
                          <span className="w-8 h-8 rounded-full bg-[#5F8B8C]/10 flex items-center
                            justify-center flex-shrink-0 group-hover:bg-[#A67C52]/10 transition-colors">
                            <FaFacebookF size={13} className="text-[#5F8B8C] group-hover:text-[#A67C52]" />
                          </span>
                          <span style={{ fontFamily: 'Libre Baskerville, serif' }}>Facebook</span>
                        </a>
                      )}
                      {artist.socialMedia.instagram && (
                        <a
                          href={artist.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-[#4A3F35]/70 hover:text-[#A67C52]
                            transition-colors group"
                        >
                          <span className="w-8 h-8 rounded-full bg-[#5F8B8C]/10 flex items-center
                            justify-center flex-shrink-0 group-hover:bg-[#A67C52]/10 transition-colors">
                            <FaInstagram size={13} className="text-[#5F8B8C] group-hover:text-[#A67C52]" />
                          </span>
                          <span style={{ fontFamily: 'Libre Baskerville, serif' }}>Instagram</span>
                        </a>
                      )}
                      {artist.socialMedia.twitter && (
                        <a
                          href={artist.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-[#4A3F35]/70 hover:text-[#A67C52]
                            transition-colors group"
                        >
                          <span className="w-8 h-8 rounded-full bg-[#5F8B8C]/10 flex items-center
                            justify-center flex-shrink-0 group-hover:bg-[#A67C52]/10 transition-colors">
                            <FaTwitter size={13} className="text-[#5F8B8C] group-hover:text-[#A67C52]" />
                          </span>
                          <span style={{ fontFamily: 'Libre Baskerville, serif' }}>Twitter</span>
                        </a>
                      )}
                      {artist.socialMedia.website && (
                        <a
                          href={artist.socialMedia.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-[#4A3F35]/70 hover:text-[#A67C52]
                            transition-colors group"
                        >
                          <span className="w-8 h-8 rounded-full bg-[#5F8B8C]/10 flex items-center
                            justify-center flex-shrink-0 group-hover:bg-[#A67C52]/10 transition-colors">
                            <HiGlobe size={14} className="text-[#5F8B8C] group-hover:text-[#A67C52]" />
                          </span>
                          <span style={{ fontFamily: 'Libre Baskerville, serif' }}>Website</span>
                        </a>
                      )}
                    </div>
                  </InfoCard>
                )}
            </div>
          </div>
        </div>
      </section>

      {/* Share overlay closer */}
      {showShareMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
      )}
    </div>
  );
};

export default ArtistDetail;