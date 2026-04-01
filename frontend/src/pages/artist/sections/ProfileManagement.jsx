import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { artistAPI } from '../../../services/api';
import {
  FiUser, FiPhone, FiMapPin, FiGlobe, FiLock, FiCamera,
  FiEye, FiEyeOff, FiSave, FiCopy, FiCheck, FiAlertTriangle,
  FiCheckCircle, FiLogOut, FiTrash2, FiUpload, FiX,
} from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { MdOutlinePalette, MdOutlineLocationOn, MdOutlineKey } from 'react-icons/md';

const SPECIALIZATIONS = [
  'Batik Clothing','Handloom Saree','Folk Jewelry','Ceramic','Statues',
  'Sri Lankan Sculpture','Wood Carving','Cane Work','Mats','Hana Fiber Crafts',
  'Coconut Crafts','Metal Craft','Lacquer Work','Folk Mural Painting',
  'Puppetry','Drum Craft','Rabana Making','Traditional Masks','Other',
];

// input base
const inputCls = "w-full border border-[#d3ab2a55] rounded-[10px] px-3 py-2 text-[13px] text-[#2E2E2E] bg-white outline-none transition-colors focus:border-[#d3ab2a]";

//toast
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => { if (!msg) return; const t = setTimeout(onDone, 3600); return () => clearTimeout(t); }, [msg, onDone]);
  if (!msg || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="fixed bottom-7 right-7 z-[99999] flex items-center gap-2.5 px-6 py-3.5 rounded-xl shadow-2xl text-white text-sm font-bold"
      style={{ background: type === 'error' ? '#c0392b' : '#5F8B8C', animation: 'psToastIn .3s ease', maxWidth: 400, fontFamily: 'Libre Baskerville, serif' }}
    >
      {type === 'error' ? <FiAlertTriangle size={18} /> : <FiCheckCircle size={18} />}
      <span>{msg}</span>
    </div>,
    document.body
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, width = 520, children, hideClose }) => {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);
  useEffect(() => {
    if (!open || hideClose) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose, hideClose]);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div
      onClick={hideClose ? undefined : onClose}
      className="fixed inset-0 z-[9000] flex items-center justify-center p-5"
      style={{ background: 'rgba(46,46,46,.72)', animation: 'psFadeIn .18s ease' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FFF8E1] rounded-[18px] w-full overflow-y-auto"
        style={{ maxWidth: width, maxHeight: '90vh', boxShadow: '0 32px 80px rgba(0,0,0,.45)', border: '1.5px solid #d3ab2a55', animation: 'psModalIn .22s cubic-bezier(.22,1,.36,1)' }}
      >
        <div className="flex items-center justify-between px-7 pt-5 pb-4 sticky top-0 bg-[#FFF8E1] rounded-t-[18px] z-[2]" style={{ borderBottom: '1px solid #d3ab2a33' }}>
          <h3 className="m-0 text-sm font-bold text-[#4A3F35]" style={{ fontFamily: 'Cinzel Decorative, serif', letterSpacing: '.03em' }}>{title}</h3>
          {!hideClose && (
            <button onClick={onClose} className="border-none bg-transparent cursor-pointer text-[#2E2E2E] p-1 rounded-lg flex items-center">
              <FiX size={20} />
            </button>
          )}
        </div>
        <div className="px-7 py-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};

// ─── Form primitives ──────────────────────────────────────────────────────────
const Field = ({ label, required, hint, children }) => (
  <div className="mb-[18px]">
    <label className="block text-[10px] font-bold text-[#5F8B8C] tracking-[.12em] mb-1.5 uppercase" style={{ fontFamily: 'Libre Baskerville, serif' }}>
      {label}{required && <span className="text-[#C48A6A]"> *</span>}
    </label>
    {children}
    {hint && <p className="m-0 mt-1.5 text-[11px] text-gray-400" style={{ fontFamily: 'Libre Baskerville, serif' }}>{hint}</p>}
  </div>
);

const Inp = ({ className = '', ...props }) => (
  <input className={`${inputCls} ${className}`} {...props} />
);
const Sel = ({ children, className = '', ...props }) => (
  <select
    className={`${inputCls} appearance-none cursor-pointer pr-8 ${className}`}
    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C48A6A' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
    {...props}
  >{children}</select>
);
const TextArea = (props) => (
  <textarea className={`${inputCls} min-h-[100px] resize-y`} {...props} />
);

const variantCls = {
  primary: 'bg-[#d3ab2a] text-[#4A3F35] border-transparent',
  danger:  'bg-[#e53e3e22] text-[#e53e3e] border border-[#e53e3e55]',
  ghost:   'bg-transparent text-[#5F8B8C] border border-[#5F8B8C55]',
  teal:    'bg-[#5F8B8C] text-white border-transparent',
  red:     'bg-[#c0392b] text-white border-transparent',
  green:   'bg-[#27ae60] text-white border-transparent',
};

const Btn = ({ variant = 'primary', className = '', children, ...props }) => (
  <button
    className={`ps-btn-hover inline-flex items-center gap-1.5 cursor-pointer rounded-[10px] font-bold text-[12px] tracking-wide px-4 py-2.5 transition-all whitespace-nowrap hover:opacity-90 ${variantCls[variant]} ${className}`}
    style={{ fontFamily: 'Libre Baskerville, serif' }}
    {...props}
  >{children}</button>
);

// ─── Card + Section title ─────────────────────────────────────────────────────
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl px-8 py-7 ${className}`} style={{ border: '1px solid #d3ab2a33', boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
    {children}
  </div>
);

const SectionTitle = ({ icon, title, subtitle }) => (
  <div className="mb-6">
    <h3 className="m-0 text-[15px] font-black text-[#4A3F35] inline-flex items-center gap-2" style={{ fontFamily: 'Cinzel Decorative, serif', letterSpacing: '.02em' }}>
      <span className="text-[#5F8B8C]">{icon}</span>{title}
    </h3>
    {subtitle && <p className="m-0 mt-1.5 text-[#5F8B8C] text-xs" style={{ fontFamily: 'Libre Baskerville, serif' }}>{subtitle}</p>}
  </div>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ size = 20 }) => (
  <div
    className="rounded-full flex-shrink-0"
    style={{ width: size, height: size, border: `3px solid #d3ab2a44`, borderTopColor: '#d3ab2a', animation: 'psSpin .7s linear infinite' }}
  />
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ProfileSettings = () => {
  const [profile, setProfile]               = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab]           = useState('profile');
  const [toast, setToast]                   = useState({ msg: '', type: 'success' });

  const [profileForm, setProfileForm]   = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [photoFile, setPhotoFile]         = useState(null);
  const [photoPreview, setPhotoPreview]   = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [confirmDeletePhoto, setConfirmDeletePhoto] = useState(false);
  const photoRef = useRef();

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw]    = useState({ current: false, new: false, confirm: false });
  const [pwChangedModal, setPwChangedModal] = useState(false);
  const [savedNewPassword, setSavedNewPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const notify = useCallback((msg, type = 'success') => setToast({ msg, type }), []);

  useEffect(() => {
    const load = async () => {
      setLoadingProfile(true);
      try {
        const res = await artistAPI.getMyProfile();
        const d   = res.data.data;
        setProfile(d);
        setProfileForm({
          fullName:          d.fullName          || '',
          bio:               d.bio               || '',
          phoneNumber:       d.phoneNumber        || '',
          gender:            d.gender             || '',
          yearsOfExperience: d.yearsOfExperience  || 0,
          specialization:    d.specialization     || [],
          street:            d.address?.street    || '',
          city:              d.address?.city      || '',
          district:          d.address?.district  || '',
          postalCode:        d.address?.postalCode || '',
          facebook:          d.socialMedia?.facebook  || '',
          instagram:         d.socialMedia?.instagram || '',
          twitter:           d.socialMedia?.twitter   || '',
          website:           d.socialMedia?.website   || '',
        });
      } catch { notify('Failed to load profile', 'error'); }
      finally { setLoadingProfile(false); }
    };
    load();
  }, [notify]);

  const setF = (k) => (e) => setProfileForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleSpec = (spec) => {
    setProfileForm((f) => ({
      ...f,
      specialization: f.specialization.includes(spec)
        ? f.specialization.filter((s) => s !== spec)
        : [...f.specialization, spec],
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setSavingProfile(true);
    try {
      const fd = new FormData();
      fd.append('fullName',          profileForm.fullName);
      fd.append('bio',               profileForm.bio);
      fd.append('phoneNumber',       profileForm.phoneNumber);
      fd.append('gender',            profileForm.gender);
      fd.append('yearsOfExperience', profileForm.yearsOfExperience);
      fd.append('specialization',    JSON.stringify(profileForm.specialization));
      fd.append('address',     JSON.stringify({ street: profileForm.street, city: profileForm.city, district: profileForm.district, postalCode: profileForm.postalCode }));
      fd.append('socialMedia', JSON.stringify({ facebook: profileForm.facebook, instagram: profileForm.instagram, twitter: profileForm.twitter, website: profileForm.website }));
      const res     = await artistAPI.updateProfile(fd);
      const updated = res.data.data;
      setProfile((prev) => ({ ...prev, ...updated }));
      setProfileForm((prev) => ({
        ...prev,
        fullName:          updated.fullName          ?? prev.fullName,
        bio:               updated.bio               ?? prev.bio,
        phoneNumber:       updated.phoneNumber        ?? prev.phoneNumber,
        gender:            updated.gender             ?? prev.gender,
        yearsOfExperience: updated.yearsOfExperience  ?? prev.yearsOfExperience,
        specialization:    updated.specialization     ?? prev.specialization,
        street:            updated.address?.street    ?? prev.street,
        city:              updated.address?.city      ?? prev.city,
        district:          updated.address?.district  ?? prev.district,
        postalCode:        updated.address?.postalCode ?? prev.postalCode,
        facebook:          updated.socialMedia?.facebook  ?? prev.facebook,
        instagram:         updated.socialMedia?.instagram ?? prev.instagram,
        twitter:           updated.socialMedia?.twitter   ?? prev.twitter,
        website:           updated.socialMedia?.website   ?? prev.website,
      }));
      notify('Profile updated successfully!');
    } catch (err) { notify(err.response?.data?.message || 'Profile update failed', 'error'); }
    finally { setSavingProfile(false); }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file));
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) return; setUploadingPhoto(true);
    try {
      const fd = new FormData(); fd.append('profilePhoto', photoFile);
      const res = await artistAPI.updateProfileImage(fd);
      const newUrl = res.data.data?.profileImage?.url || res.data.data?.profilePhoto;
      setProfile((prev) => ({ ...prev, profilePhoto: newUrl, profileImage: res.data.data?.profileImage }));
      setPhotoFile(null); setPhotoPreview(null);
      notify('Profile photo updated!');
    } catch (err) { notify(err.response?.data?.message || 'Photo upload failed', 'error'); }
    finally { setUploadingPhoto(false); }
  };

  const handleDeletePhoto = async () => {
    setUploadingPhoto(true);
    try { await artistAPI.updateProfile(new FormData()).catch(() => {}); }
    finally {
      setProfile((prev) => ({ ...prev, profilePhoto: '', profileImage: null }));
      setPhotoFile(null); setPhotoPreview(null); setConfirmDeletePhoto(false); setUploadingPhoto(false);
      notify('Profile photo removed.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { notify('New passwords do not match.', 'error'); return; }
    if (pwForm.newPassword.length < 8)                { notify('New password must be at least 8 characters.', 'error'); return; }
    setSavingPw(true);
    try {
      await artistAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setSavedNewPassword(pwForm.newPassword); setPwChangedModal(true);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { notify(err.response?.data?.message || 'Password change failed.', 'error'); }
    finally { setSavingPw(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Email: ${profile?.email}\nPassword: ${savedNewPassword}`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const TABS = [
    { id: 'profile',  label: 'Profile Info',    icon: <FiUser   size={14} /> },
    { id: 'photo',    label: 'Profile Photo',   icon: <FiCamera size={14} /> },
    { id: 'password', label: 'Change Password', icon: <FiLock   size={14} /> },
  ];

  const currentPhoto = photoPreview || profile?.profileImage?.url || profile?.profilePhoto || null;

  if (loadingProfile) return (
    <div className="flex flex-col items-center justify-center min-h-[380px] gap-3.5 bg-[#FFF8E1]">
      <Spinner size={44} />
      <p className="text-[#5F8B8C] text-[13px]" style={{ fontFamily: 'Libre Baskerville, serif' }}>Loading your profile…</p>
    </div>
  );

  return (
    <>
      <div className="min-h-screen px-6 py-7" style={{ background: '#FFF8E1', fontFamily: 'Libre Baskerville, serif' }}>

        {/* Header */}
        <div className="mb-7">
          <h2 className="m-0 text-xl font-black text-[#4A3F35] tracking-tight" style={{ fontFamily: 'Cinzel Decorative, serif' }}>Profile Settings</h2>
          <p className="mt-1.5 m-0 text-[#5F8B8C] text-[13px]">Manage your artist profile, photo and security settings</p>
        </div>

        {/* profile Summary */}
        <Card className="mb-6 !px-7 !py-5">
          <div className="flex items-center gap-5">
            <div className="w-[70px] h-[70px] rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: '#4A3F3522', border: '3px solid #d3ab2a55' }}>
              {currentPhoto
                ? <img src={currentPhoto} alt="Profile" className="w-full h-full object-cover" />
                : <MdOutlinePalette size={30} color="#4A3F35" />}
            </div>
            <div className="flex-1">
              <div className="text-[17px] font-black text-[#4A3F35]" style={{ fontFamily: 'Cinzel Decorative, serif', letterSpacing: '.01em' }}>{profile?.fullName || 'Artist'}</div>
              <div className="text-xs text-[#C48A6A] mt-0.5">{profile?.email}</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {(profile?.specialization || []).slice(0, 3).map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: '#5F8B8C22', color: '#5F8B8C', border: '1px solid #5F8B8C33', fontFamily: 'Libre Baskerville, serif' }}>{s}</span>
                ))}
                {(profile?.specialization || []).length > 3 && (
                  <span className="text-[10px] text-[#C48A6A] px-1" style={{ fontFamily: 'Libre Baskerville, serif' }}>+{profile.specialization.length - 3} more</span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[11px] text-gray-400 mb-0.5">Province</div>
              <div className="text-[13px] font-bold text-[#4A3F35]">{profile?.province || '—'}</div>
            </div>
          </div>
        </Card>

        {/* tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`ps-tab inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] font-bold text-xs tracking-wide cursor-pointer transition-all ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                border: `1.5px solid ${activeTab === tab.id ? '#d3ab2a' : '#d3ab2a44'}`,
                background: activeTab === tab.id ? '#d3ab2a22' : '#fff',
                color: activeTab === tab.id ? '#4A3F35' : '#2E2E2E',
                fontFamily: 'Libre Baskerville, serif',
              }}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* profile info tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile}>
            <Card className="mb-5">
              <SectionTitle icon={<FiUser size={16} />} title="Basic Information" subtitle="Your public artist profile details" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name" required>
                  <Inp value={profileForm.fullName} onChange={setF('fullName')} required placeholder="Your full name" />
                </Field>
                <Field label="Phone Number" required>
                  <div className="relative">
                    <Inp value={profileForm.phoneNumber} onChange={setF('phoneNumber')} required placeholder="+94 77 000 0000" className="!pl-9" />
                    <FiPhone size={14} color="#C48A6A" className="absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </Field>
                <Field label="Gender">
                  <Sel value={profileForm.gender} onChange={setF('gender')}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Sel>
                </Field>
                <Field label="Years of Experience">
                  <Inp type="number" min="0" max="80" value={profileForm.yearsOfExperience} onChange={setF('yearsOfExperience')} />
                </Field>
                <div className="col-span-2">
                  <Field label="Bio / About You">
                    <TextArea value={profileForm.bio} onChange={setF('bio')} placeholder="Tell the world about your art, your story, your inspiration…" rows={4} />
                  </Field>
                </div>
              </div>
            </Card>

            <Card className="mb-5">
              <SectionTitle icon={<MdOutlinePalette size={18} />} title="Specializations" subtitle="Select all art forms you practice" />
              <div className="flex gap-2 flex-wrap">
                {SPECIALIZATIONS.map((spec) => {
                  const active = profileForm.specialization?.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      className="ps-spec-chip px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5"
                      onClick={() => toggleSpec(spec)}
                      style={{
                        border: `1.5px solid ${active ? '#d3ab2a' : '#d3ab2a44'}`,
                        background: active ? '#d3ab2a22' : '#fff',
                        color: active ? '#4A3F35' : '#2E2E2E',
                        fontFamily: 'Libre Baskerville, serif',
                      }}
                    >
                      {active && <FiCheck size={11} />}{spec}
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card className="mb-5">
              <SectionTitle icon={<MdOutlineLocationOn size={18} />} title="Address" subtitle="Your studio or home address" />
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="Street">
                    <div className="relative">
                      <Inp value={profileForm.street} onChange={setF('street')} placeholder="Street address" className="!pl-9" />
                      <FiMapPin size={14} color="#C48A6A" className="absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </Field>
                </div>
                <Field label="City"><Inp value={profileForm.city} onChange={setF('city')} placeholder="City" /></Field>
                <Field label="District"><Inp value={profileForm.district} onChange={setF('district')} placeholder="District" /></Field>
                <Field label="Postal Code"><Inp value={profileForm.postalCode} onChange={setF('postalCode')} placeholder="Postal code" /></Field>
              </div>
            </Card>

            <Card className="mb-6">
              <SectionTitle icon={<FiGlobe size={16} />} title="Social Media" subtitle="Share your online presence" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Facebook">
                  <div className="relative"><Inp value={profileForm.facebook} onChange={setF('facebook')} placeholder="https://facebook.com/…" className="!pl-9" />
                    <FaFacebook size={14} color="#1877F2" className="absolute left-3 top-1/2 -translate-y-1/2" /></div>
                </Field>
                <Field label="Instagram">
                  <div className="relative"><Inp value={profileForm.instagram} onChange={setF('instagram')} placeholder="https://instagram.com/…" className="!pl-9" />
                    <FaInstagram size={14} color="#E1306C" className="absolute left-3 top-1/2 -translate-y-1/2" /></div>
                </Field>
                <Field label="Twitter / X">
                  <div className="relative"><Inp value={profileForm.twitter} onChange={setF('twitter')} placeholder="https://twitter.com/…" className="!pl-9" />
                    <FaTwitter size={14} color="#1DA1F2" className="absolute left-3 top-1/2 -translate-y-1/2" /></div>
                </Field>
                <Field label="Website">
                  <div className="relative"><Inp value={profileForm.website} onChange={setF('website')} placeholder="https://yourwebsite.com" className="!pl-9" />
                    <FiGlobe size={14} color="#5F8B8C" className="absolute left-3 top-1/2 -translate-y-1/2" /></div>
                </Field>
              </div>
            </Card>

            <div className="flex justify-end items-center gap-2.5">
              {savingProfile && <Spinner />}
              <Btn type="submit" variant="primary" disabled={savingProfile} className="!px-7 !text-[13px]">
                <FiSave size={14} />{savingProfile ? 'Saving…' : 'Save Profile'}
              </Btn>
            </div>
          </form>
        )}

        {/*photo tab */}
        {activeTab === 'photo' && (
          <Card>
            <SectionTitle icon={<FiCamera size={16} />} title="Profile Photo" subtitle="Upload or change your profile picture" />
            <div className="flex flex-col items-center gap-5 mb-7">
              <div className="relative w-40 h-40 rounded-full overflow-hidden flex items-center justify-center" style={{ background: '#4A3F3518', border: '4px solid #d3ab2a55', boxShadow: '0 4px 24px #d3ab2a44' }}>
                {currentPhoto
                  ? <img src={currentPhoto} alt="Profile" className="w-full h-full object-cover" />
                  : <MdOutlinePalette size={56} color="#4A3F35" />}
                {photoPreview && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-1.5 text-center text-[10px] text-white font-bold" style={{ fontFamily: 'Libre Baskerville, serif' }}>PREVIEW</div>
                )}
              </div>
              {photoFile && (
                <p className="m-0 text-xs text-[#5F8B8C] italic" style={{ fontFamily: 'Libre Baskerville, serif' }}>Selected: {photoFile.name}</p>
              )}
            </div>

            <div
              onClick={() => photoRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
              }}
              className="border-[2.5px] border-dashed border-[#d3ab2a88] rounded-[14px] p-7 text-center cursor-pointer mb-5 transition-colors hover:bg-[#d3ab2a0a]"
              style={{ background: '#d3ab2a07' }}
            >
              <FiUpload size={36} color="#d3ab2a" className="mx-auto mb-2" />
              <p className="m-0 text-[#5F8B8C] text-[13px]" style={{ fontFamily: 'Libre Baskerville, serif' }}>Drag & drop or <strong className="text-[#d3ab2a]">click to browse</strong></p>
              <p className="m-0 mt-1 text-[11px] text-[#C48A6A]" style={{ fontFamily: 'Libre Baskerville, serif' }}>JPG, PNG, WEBP · Max 5MB</p>
            </div>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

            <div className="flex justify-between flex-wrap gap-2.5">
              <div>
                {(profile?.profilePhoto || profile?.profileImage?.url) && !photoFile && (
                  <Btn variant="danger" onClick={() => setConfirmDeletePhoto(true)} disabled={uploadingPhoto}>
                    <FiTrash2 size={13} /> Remove Photo
                  </Btn>
                )}
              </div>
              <div className="flex gap-2.5 items-center">
                {uploadingPhoto && <Spinner />}
                {photoFile && (
                  <>
                    <Btn variant="ghost" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} disabled={uploadingPhoto}>Cancel</Btn>
                    <Btn variant="teal" onClick={handleUploadPhoto} disabled={uploadingPhoto}>
                      <FiUpload size={13} />{uploadingPhoto ? 'Uploading…' : 'Upload Photo'}
                    </Btn>
                  </>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* password tab */}
        {activeTab === 'password' && (
          <Card style={{ maxWidth: 520 }}>
            <SectionTitle icon={<MdOutlineKey size={18} />} title="Change Password" subtitle="Your session stays active after changing password." />
            <form onSubmit={handleChangePassword}>
              <Field label="Current Password" required>
                <div className="relative">
                  <Inp type={showPw.current ? 'text' : 'password'} value={pwForm.currentPassword} onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))} required placeholder="Enter current password" className="!pr-11" />
                  <button type="button" onClick={() => setShowPw((s) => ({ ...s, current: !s.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-[#C48A6A] flex items-center">
                    {showPw.current ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </Field>

              <Field label="New Password" required hint="Minimum 8 characters">
                <div className="relative">
                  <Inp type={showPw.new ? 'text' : 'password'} value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} required placeholder="Enter new password" className="!pr-11" />
                  <button type="button" onClick={() => setShowPw((s) => ({ ...s, new: !s.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-[#C48A6A] flex items-center">
                    {showPw.new ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </Field>

              {/* Password strength meter */}
              {pwForm.newPassword && (() => {
                const len      = pwForm.newPassword.length;
                const strength = len < 8 ? 0 : len < 12 ? 1 : len < 16 ? 2 : 3;
                const labels   = ['Too short', 'Fair', 'Good', 'Strong'];
                const colors   = ['#e53e3e', '#C48A6A', '#d3ab2a', '#27ae60'];
                return (
                  <div className="-mt-2.5 mb-4">
                    <div className="flex gap-1 mb-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex-1 h-1 rounded transition-all duration-300" style={{ background: i <= strength ? colors[strength] : '#d3ab2a33' }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: colors[strength], fontFamily: 'Libre Baskerville, serif' }}>{labels[strength]}</span>
                  </div>
                );
              })()}

              <Field label="Confirm New Password" required>
                <div className="relative">
                  <Inp
                    type={showPw.confirm ? 'text' : 'password'}
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    required placeholder="Repeat new password"
                    className="!pr-11"
                    style={pwForm.confirmPassword ? { borderColor: pwForm.confirmPassword === pwForm.newPassword ? '#27ae6099' : '#c0392b99' } : {}}
                  />
                  <button type="button" onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-[#C48A6A] flex items-center">
                    {showPw.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword && (
                  <p className="m-0 mt-1.5 text-[11px] text-[#c0392b] flex items-center gap-1" style={{ fontFamily: 'Libre Baskerville, serif' }}>
                    <FiAlertTriangle size={11} /> Passwords do not match
                  </p>
                )}
              </Field>

              <div className="flex justify-end items-center gap-2.5 mt-2">
                {savingPw && <Spinner />}
                <Btn type="submit" variant="primary" disabled={savingPw} className="!px-7 !text-[13px]">
                  <FiLock size={14} />{savingPw ? 'Changing…' : 'Change Password'}
                </Btn>
              </div>
            </form>
          </Card>
        )}
      </div>

      {/* password Changed Modal */}
      <Modal open={pwChangedModal} onClose={() => setPwChangedModal(false)} title="Password Changed Successfully" width={480}>
        <div>
          <div className="flex gap-2.5 items-start px-4 py-3 rounded-[10px] mb-5 bg-[#e8f5e9]" style={{ border: '1.5px solid #27ae6066' }}>
            <FiCheckCircle size={20} color="#27ae60" className="flex-shrink-0 mt-0.5" />
            <p className="m-0 text-xs text-[#4A3F35] leading-relaxed" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              Your password has been changed. <strong>You are still logged in</strong> — your current session remains active.
            </p>
          </div>
          <div className="bg-[#2E2E2E] rounded-xl px-6 py-5 mb-5 font-mono text-[13px]">
            <div className="text-[10px] uppercase tracking-[.1em] text-gray-500 mb-2.5" style={{ fontFamily: 'Libre Baskerville, serif' }}>Your New Login Credentials</div>
            <div className="mb-2"><span className="text-[#d3ab2a]">Email:&nbsp;</span><span className="text-[#e0e0e0]">{profile?.email}</span></div>
            <div><span className="text-[#d3ab2a]">Password:&nbsp;</span><span className="text-[#e0e0e0] tracking-wide">{savedNewPassword}</span></div>
          </div>
          <Btn
            variant={copied ? 'green' : 'teal'}
            onClick={handleCopy}
            className="w-full !justify-center !py-3 !text-[13px] mb-3.5"
          >
            {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
            {copied ? 'Copied!' : 'Copy Credentials'}
          </Btn>
          <div className="flex gap-2.5 justify-end pt-4" style={{ borderTop: '1px solid #d3ab2a33' }}>
            <Btn variant="primary" onClick={() => { setPwChangedModal(false); notify('Password changed! You are still logged in.'); }}>
              Continue (Stay Logged In)
            </Btn>
            <Btn variant="ghost" onClick={handleLogout}><FiLogOut size={13} /> Logout</Btn>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Photo Modal */}
      <Modal open={confirmDeletePhoto} onClose={() => setConfirmDeletePhoto(false)} title="Remove Profile Photo" width={420}>
        <p className="text-[#2E2E2E] m-0 mb-5 text-[13px] leading-relaxed" style={{ fontFamily: 'Libre Baskerville, serif' }}>
          Are you sure you want to remove your profile photo?
        </p>
        <div className="flex gap-2.5 justify-end">
          <Btn variant="ghost" onClick={() => setConfirmDeletePhoto(false)} disabled={uploadingPhoto}>Cancel</Btn>
          <Btn variant="danger" onClick={handleDeletePhoto} disabled={uploadingPhoto}>
            <FiTrash2 size={13} />{uploadingPhoto ? 'Removing…' : 'Remove Photo'}
          </Btn>
        </div>
      </Modal>

      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: '', type: 'success' })} />
    </>
  );
};

export default ProfileSettings;