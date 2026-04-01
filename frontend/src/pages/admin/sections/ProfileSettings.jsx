import React, { useState, useEffect, useRef } from 'react';
import {
  User, Phone, MapPin, Mail, Lock, Eye, EyeOff,
  Camera, Save, RefreshCw, Copy, CheckCircle,
  AlertCircle, Shield, Edit3, X, Key,
  Building2, UserCheck, Info, Trash2
} from 'lucide-react';
import { adminAPI, authAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  const bg =
    type === 'success' ? 'bg-[#8DAA91]'
    : type === 'error' ? 'bg-red-500'
    : 'bg-[#A67C52]';
  return (
    <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-semibold ${bg}`}>
      {type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
      {msg}
    </div>
  );
};

const ProfileSettings = () => {
  const { logout } = useAuth();
  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [activeTab, setActiveTab]       = useState('profile');
  const [toast, setToast]               = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile]       = useState(null);
  const fileRef = useRef();

  // profile form
  const [form, setForm] = useState({
    fullName: '', phoneNumber: '', whatsappNumber: '',
    address: { street: '', city: '', district: '', postalCode: '' },
    _clearPhoto: false
  });

  // password form
  const [pwForm, setPwForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw]   = useState({ current: false, new: false, confirm: false });

  // new password reveal modal
  const [credModal, setCredModal] = useState(null);
  const [copied, setCopied]       = useState(false);

  // officer handover modal
  const [handoverModal, setHandoverModal]         = useState(false);
  const [handoverSaving, setHandoverSaving]       = useState(false);
  const [handoverForm, setHandoverForm]           = useState({
    fullName: '', phoneNumber: '', whatsappNumber: '',
    address: { street: '', city: '', district: '', postalCode: '' },
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [showHandoverPw, setShowHandoverPw]       = useState({ current: false, new: false, confirm: false });
  const [handoverCredModal, setHandoverCredModal] = useState(null);
  const [handoverCopied, setHandoverCopied]       = useState(false);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  //fetch 
  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getMyProfile();
      if (res.data.success) {
        const d = res.data.data;
        setProfile(d);
        setForm({
          fullName:       d.fullName        || '',
          phoneNumber:    d.phoneNumber     || '',
          whatsappNumber: d.whatsappNumber  || '',
          address: {
            street:     d.address?.street     || '',
            city:       d.address?.city       || '',
            district:   d.address?.district   || '',
            postalCode: d.address?.postalCode || ''
          },
          _clearPhoto: false
        });
        if (d.profilePhoto) setPhotoPreview(d.profilePhoto);
        else setPhotoPreview(null);
      }
    } catch {
      showToast('Error loading profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  // photo 
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setForm(f => ({ ...f, _clearPhoto: false }));
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setForm(f => ({ ...f, _clearPhoto: true }));
    if (fileRef.current) fileRef.current.value = '';
  };

  //save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('fullName',       form.fullName);
      fd.append('phoneNumber',    form.phoneNumber);
      fd.append('whatsappNumber', form.whatsappNumber);
      fd.append('address',        JSON.stringify(form.address));
      if (photoFile)        fd.append('profilePhoto', photoFile);
      fd.append('clearPhoto', form._clearPhoto ? 'true' : 'false');

      const res = await adminAPI.updateProfile(fd);
      if (res.data.success) {
        setPhotoFile(null);
        setForm(f => ({ ...f, _clearPhoto: false }));
        await fetchProfile();
        showToast('Profile updated successfully!');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Change password 
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast('New passwords do not match', 'error'); return;
    }
    if (pwForm.newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error'); return;
    }
    try {
      setSaving(true);
      const res = await adminAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword
      });
      if (res.data.success) {
        setCredModal({ email: profile?.email, password: pwForm.newPassword });
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Incorrect current password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openHandover = () => {
    setHandoverForm({
      fullName:       profile?.fullName        || '',
      phoneNumber:    profile?.phoneNumber     || '',
      whatsappNumber: profile?.whatsappNumber  || '',
      address: {
        street:     profile?.address?.street     || '',
        city:       profile?.address?.city       || '',
        district:   profile?.address?.district   || '',
        postalCode: profile?.address?.postalCode || ''
      },
      currentPassword: '',
      newPassword:     '',
      confirmPassword: ''
    });
    setShowHandoverPw({ current: false, new: false, confirm: false });
    setHandoverModal(true);
  };

  const handleHandoverCopy = (text) => {
    navigator.clipboard.writeText(text);
    setHandoverCopied(true);
    setTimeout(() => setHandoverCopied(false), 2000);
  };

  // save handover 
  const handleHandoverSave = async (e) => {
    e.preventDefault();
    if (!handoverForm.fullName.trim()) {
      showToast('New officer name is required', 'error'); return;
    }
    if (!handoverForm.newPassword) {
      showToast('Please set a password for the new officer', 'error'); return;
    }
    if (handoverForm.newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error'); return;
    }
    if (handoverForm.newPassword !== handoverForm.confirmPassword) {
      showToast('Passwords do not match', 'error'); return;
    }
    if (!handoverForm.currentPassword) {
      showToast('Please enter your current password to authorize this handover', 'error'); return;
    }
    try {
      setHandoverSaving(true);

      const savedEmail    = profile?.email;
      const savedName     = handoverForm.fullName;
      const savedPassword = handoverForm.newPassword;

      const profileFd = new FormData();
      profileFd.append('fullName',       handoverForm.fullName);
      profileFd.append('phoneNumber',    handoverForm.phoneNumber);
      profileFd.append('whatsappNumber', handoverForm.whatsappNumber);
      profileFd.append('address',        JSON.stringify(handoverForm.address));
      profileFd.append('clearPhoto',     'true');
      await adminAPI.updateProfile(profileFd);

      await adminAPI.changePassword({
        currentPassword: handoverForm.currentPassword,
        newPassword:     savedPassword
      });

      try {
        const loginRes = await authAPI.login({ email: savedEmail, password: savedPassword });
        if (loginRes.data?.token) {
          localStorage.setItem('token', loginRes.data.token);
          if (loginRes.data?.data?.user) {
            localStorage.setItem('user', JSON.stringify(loginRes.data.data.user));
          }
        }
      } catch {

      }

      setHandoverModal(false);
      setHandoverCredModal({ email: savedEmail, name: savedName, password: savedPassword });
    } catch (err) {
      showToast(err.response?.data?.message || 'Error during handover', 'error');
    } finally {
      setHandoverSaving(false);
    }
  };

  const pwStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8)  s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-[#A67C52]', 'bg-[#d3ab2a]', 'bg-[#8DAA91]'];

  const tabs = [
    { id: 'profile',  label: 'My Profile',      icon: <User size={17}/> },
    { id: 'password', label: 'Change Password',  icon: <Lock size={17}/> },
    { id: 'handover', label: 'Officer Handover', icon: <UserCheck size={17}/> },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#8DAA91] border-t-transparent"/>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      {/* header  */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#4A3F35]">Profile Settings</h1>
          <p className="text-[#2E2E2E]/60 mt-1">Manage your account details and province handover</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#8DAA91]/12 rounded-xl border border-[#8DAA91]/25">
          <Building2 size={16} className="text-[#8DAA91]"/>
          <span className="text-sm font-bold text-[#4A3F35]">{profile?.province} Province</span>
        </div>
      </div>

      {/*profile Hero */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* banner */}
        <div className="h-24 bg-gradient-to-r from-[#8DAA91] via-[#7A9980] to-[#5F8B8C]"/>

        {/* avatar row */}
        <div className="px-8 pb-6">
          <div className="flex items-end gap-5 -mt-12">

            {/* avatar and camera */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-[#8DAA91] to-[#5F8B8C]">
                {photoPreview
                  ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                      {profile?.fullName?.charAt(0) || 'A'}
                    </div>
                }
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                title="Change photo"
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-[#A67C52] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#8a6440] transition-colors">
                <Camera size={14}/>
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden"/>
            </div>

            <div className="min-w-0 flex-1 mb-2">
              <h2 className="text-xl font-bold pt-2 text-[#4A3F35] truncate">{profile?.fullName}</h2>
              <p className="text-[#2E2E2E]/55 pt-5 text-sm truncate">{profile?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 px-3 py-0.5 bg-[#8DAA91]/15 text-[#4A6B4A] text-xs font-semibold rounded-full">
                <Shield size={11}/> Province Administrator
              </span>
            </div>
          </div>

          {/* remove / Change photo*/}
          {photoPreview && (
            <div className="mt-4 flex items-center gap-3">
              {/* change photo button */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8DAA91]/40 text-[#8DAA91] text-xs font-semibold hover:bg-[#8DAA91]/10 transition-colors">
                <Camera size={13}/> Change Photo
              </button>

              {/* remove photo button */}
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-400 text-xs font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors">
                <Trash2 size={13}/> Remove Photo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* tabs*/}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="flex border-b border-[#8DAA91]/12 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id ? 'text-[#8DAA91]' : 'text-[#2E2E2E]/50 hover:text-[#4A3F35]'
              }`}>
              {tab.icon}{tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8DAA91] rounded-t-full"/>
              )}
            </button>
          ))}
        </div>

        <div className="p-8">

          {/* mY profile*/}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-7">
              <div>
                <h3 className="text-base font-bold text-[#4A3F35] flex items-center gap-2 mb-5">
                  <User size={18} className="text-[#8DAA91]"/> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* full name */}
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Full Name *</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DAA91]"/>
                      <input type="text" required value={form.fullName}
                        onChange={e => setForm({...form, fullName: e.target.value})}
                        className="w-full pl-9 pr-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] text-[#4A3F35]"
                        placeholder="Your full name"/>
                    </div>
                  </div>

                  {/* email  */}
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">
                      Email Address
                      <span className="ml-2 text-xs text-[#2E2E2E]/35 font-normal">(cannot be changed)</span>
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DAA91]/40"/>
                      <input type="email" value={profile?.email || ''} disabled
                        className="w-full pl-9 pr-4 py-3 border-2 border-[#8DAA91]/10 rounded-xl bg-[#F4EDE4]/60 text-[#2E2E2E]/45 cursor-not-allowed truncate"/>
                    </div>
                  </div>

                  {/* phone */}
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DAA91]"/>
                      <input type="tel" value={form.phoneNumber}
                        onChange={e => setForm({...form, phoneNumber: e.target.value})}
                        className="w-full pl-9 pr-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] text-[#4A3F35]"
                        placeholder="+94 77 000 0000"/>
                    </div>
                  </div>

                  {/* whatsApp */}
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">WhatsApp</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DAA91]"/>
                      <input type="tel" value={form.whatsappNumber}
                        onChange={e => setForm({...form, whatsappNumber: e.target.value})}
                        className="w-full pl-9 pr-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] text-[#4A3F35]"
                        placeholder="+94 77 000 0000"/>
                    </div>
                  </div>
                </div>
              </div>

              {/* address */}
              <div>
                <h3 className="text-base font-bold text-[#4A3F35] flex items-center gap-2 mb-5">
                  <MapPin size={18} className="text-[#8DAA91]"/> Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Street</label>
                    <input type="text" value={form.address.street}
                      onChange={e => setForm({...form, address: {...form.address, street: e.target.value}})}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] text-[#4A3F35]"
                      placeholder="No. 12, Temple Road"/>
                  </div>
                  {[
                    ['City', 'city', 'e.g. Kurunegala'],
                    ['District', 'district', 'e.g. Kurunegala'],
                    ['Postal Code', 'postalCode', 'e.g. 60000'],
                  ].map(([lbl, key, ph]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-[#4A3F35] mb-2">{lbl}</label>
                      <input type="text" value={form.address[key]} placeholder={ph}
                        onChange={e => setForm({...form, address: {...form.address, [key]: e.target.value}})}
                        className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] text-[#4A3F35]"/>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#8DAA91] to-[#7A9980] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-60 font-semibold">
                  {saving ? <RefreshCw size={17} className="animate-spin"/> : <Save size={17}/>}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/*change pw tab*/}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
              <h3 className="text-base font-bold text-[#4A3F35] flex items-center gap-2">
                <Key size={18} className="text-[#8DAA91]"/> Change Password
              </h3>

              <div className="p-4 bg-[#FFF8E1] border border-[#d3ab2a]/25 rounded-xl text-xs text-[#4A3F35]/70 space-y-0.5">
                <p className="font-semibold text-[#d3ab2a] mb-1">Password requirements</p>
                <p>• Minimum 8 characters</p>
                <p>• Mix uppercase, lowercase, numbers &amp; symbols</p>
              </div>

              {[
                { label: 'Current Password',     field: 'currentPassword', vis: 'current' },
                { label: 'New Password',          field: 'newPassword',     vis: 'new'     },
                { label: 'Confirm New Password',  field: 'confirmPassword', vis: 'confirm' },
              ].map(({ label, field, vis }) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-[#4A3F35] mb-2">{label}</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DAA91]"/>
                    <input
                      type={showPw[vis] ? 'text' : 'password'} required
                      value={pwForm[field]}
                      onChange={e => setPwForm({...pwForm, [field]: e.target.value})}
                      className="w-full pl-9 pr-11 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] text-[#4A3F35]"
                      placeholder="••••••••"
                    />
                    <button type="button"
                      onClick={() => setShowPw({...showPw, [vis]: !showPw[vis]})}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2E2E2E]/35 hover:text-[#4A3F35]">
                      {showPw[vis] ? <EyeOff size={17}/> : <Eye size={17}/>}
                    </button>
                  </div>
                </div>
              ))}

              {/* Strength bar */}
              {pwForm.newPassword && (() => {
                const s = pwStrength(pwForm.newPassword);
                return (
                  <div>
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= s ? strengthColor[s] : 'bg-[#8DAA91]/15'}`}/>
                      ))}
                    </div>
                    <p className="text-xs mt-1 text-[#2E2E2E]/50">{strengthLabel[s]}</p>
                  </div>
                );
              })()}

              <div className="flex justify-end pt-1">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#A67C52] to-[#C48A6A] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-60 font-semibold">
                  {saving ? <RefreshCw size={17} className="animate-spin"/> : <Shield size={17}/>}
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {/* officer handover tab */}
          {activeTab === 'handover' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-base font-bold text-[#4A3F35] flex items-center gap-2">
                <UserCheck size={18} className="text-[#8DAA91]"/> Officer Handover
              </h3>

              {/* Explain card */}
              <div className="p-5 bg-[#F4EDE4] rounded-2xl border border-[#A67C52]/20 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#8DAA91]/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Info size={20} className="text-[#8DAA91]"/>
                  </div>
                  <div>
                    <p className="font-bold text-[#4A3F35] mb-1">How Province Handover Works</p>
                    <p className="text-sm text-[#2E2E2E]/65 leading-relaxed">
                      The <strong>{profile?.province} Province</strong> admin account will <strong>not be deleted</strong>.
                      Only the profile details (name, photo, phone, address) will be replaced with the new officer's information.
                      The login email <strong>({profile?.email})</strong> stays the same.
                    </p>
                  </div>
                </div>

                {/* Current officer summary */}
                <div className="mt-2 p-4 bg-white rounded-xl border border-[#8DAA91]/15">
                  <p className="text-xs font-semibold text-[#2E2E2E]/45 uppercase tracking-wide mb-2">Current Officer</p>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-[#8DAA91] to-[#5F8B8C] flex-shrink-0">
                      {profile?.profilePhoto
                        ? <img src={profile.profilePhoto} className="w-full h-full object-cover" alt=""/>
                        : <div className="w-full h-full flex items-center justify-center text-white font-bold">
                            {profile?.fullName?.charAt(0)}
                          </div>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#4A3F35] text-sm truncate">{profile?.fullName}</p>
                      <p className="text-xs text-[#2E2E2E]/50 truncate">{profile?.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action button */}
              <button onClick={openHandover}
                className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-[#A67C52] to-[#C48A6A] text-white rounded-xl hover:shadow-lg transition-all font-semibold">
                <Edit3 size={17}/> Start Handover to New Officer
              </button>
            </div>
          )}
        </div>
      </div>

      {/*pw credential dispaly */}
      {credModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#8DAA91]/12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Key size={30} className="text-[#8DAA91]"/>
              </div>
              <h2 className="text-2xl font-bold text-[#4A3F35]">Password Updated</h2>
              <p className="text-[#2E2E2E]/55 text-sm mt-1">Copy your new password before closing</p>
            </div>

            <div className="bg-[#F4EDE4] rounded-xl p-5 space-y-3 mb-6 border border-[#A67C52]/15">
              <div>
                <p className="text-xs font-semibold text-[#2E2E2E]/45 uppercase tracking-wide mb-1">Login Email</p>
                <p className="font-semibold text-[#4A3F35] text-sm break-all">{credModal.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#2E2E2E]/45 uppercase tracking-wide mb-1">New Password</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2.5 rounded-lg font-mono text-[#4A3F35] text-sm border border-[#8DAA91]/20 tracking-widest break-all">
                    {credModal.password}
                  </code>
                  <button onClick={() => handleCopy(credModal.password)}
                    className={`p-2.5 rounded-lg transition-all flex-shrink-0 ${copied ? 'bg-[#8DAA91] text-white' : 'bg-[#8DAA91]/15 text-[#8DAA91] hover:bg-[#8DAA91]/30'}`}>
                    {copied ? <CheckCircle size={17}/> : <Copy size={17}/>}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-[#2E2E2E]/40 mb-5">
              This window will not show again after closing
            </div>

            <button onClick={() => setCredModal(null)}
              className="w-full py-3 bg-gradient-to-r from-[#8DAA91] to-[#7A9980] text-white rounded-xl font-semibold hover:shadow-lg transition-all">
              I've Saved My Password
            </button>
          </div>
        </div>
      )}

      {/* handover form*/}
      {handoverModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]">

            {/*header */}
            <div className="bg-white px-8 py-5 flex items-start justify-between rounded-t-2xl border-b-2 border-[#8DAA91]/25 flex-shrink-0">
              <div className="min-w-0 pr-4">
                <h2 className="text-xl font-bold text-[#4A3F35]">New Officer Details</h2>
                <p className="text-xs text-[#2E2E2E]/45 mt-1 flex items-center gap-1.5">
                  <Building2 size={12} className="text-[#8DAA91] flex-shrink-0"/>
                  Replacing profile for the <strong className="text-[#8DAA91] font-semibold">{profile?.province}</strong> province account
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHandoverModal(false)}
                className="flex-shrink-0 p-2 hover:bg-[#F4EDE4] rounded-xl transition-colors mt-0.5">
                <X size={20} className="text-[#4A3F35]/60"/>
              </button>
            </div>

            <form onSubmit={handleHandoverSave} className="p-8 space-y-6 overflow-y-auto flex-1">

              {/* Cleared note  */}
              <div className="rounded-xl overflow-hidden border border-[#d3ab2a]/40 shadow-sm">
                {/* Form title row */}
                <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-[#d3ab2a]/20">
                  <UserCheck size={16} className="text-[#8DAA91] flex-shrink-0"/>
                  <span className="text-sm font-bold text-[#4A3F35]">Officer Handover Form</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#d3ab2a]/15 border-b border-[#d3ab2a]/30">
                  <AlertCircle size={15} className="text-[#b8921e] flex-shrink-0"/>
                  <span className="text-xs font-bold text-[#b8921e] uppercase tracking-wide">Before You Continue</span>
                </div>

                {/* body */}
                <div className="px-4 py-3.5 bg-[#FFFDF0] space-y-2.5">
                  {/* cleared row */}
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 block"/>
                    </span>
                    <p className="text-xs text-[#4A3F35]/80 leading-relaxed">
                      <span className="font-semibold text-[#4A3F35]">Will be cleared: </span>
                      name, profile photo, phone, WhatsApp and address.
                    </p>
                  </div>

                  {/* stays row */}
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-[#8DAA91]/20 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8DAA91] block"/>
                    </span>
                    <p className="text-xs text-[#4A3F35]/80 leading-relaxed">
                      <span className="font-semibold text-[#4A3F35]">Stays the same: </span>
                      login email ({profile?.email}), province, account history.
                    </p>
                  </div>
                </div>
              </div>

              {/*new officer detail */}
              <div>
                <h4 className="text-sm font-bold text-[#4A3F35] mb-4 flex items-center gap-2">
                  <User size={16} className="text-[#8DAA91]"/> New Officer Personal Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Full Name *</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DAA91]"/>
                      <input type="text" required value={handoverForm.fullName}
                        onChange={e => setHandoverForm({...handoverForm, fullName: e.target.value})}
                        className="w-full pl-9 pr-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] text-[#4A3F35]"
                        placeholder="New officer's full name"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DAA91]"/>
                      <input type="tel" value={handoverForm.phoneNumber}
                        onChange={e => setHandoverForm({...handoverForm, phoneNumber: e.target.value})}
                        className="w-full pl-9 pr-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] text-[#4A3F35]"
                        placeholder="+94 77 000 0000"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">WhatsApp</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DAA91]"/>
                      <input type="tel" value={handoverForm.whatsappNumber}
                        onChange={e => setHandoverForm({...handoverForm, whatsappNumber: e.target.value})}
                        className="w-full pl-9 pr-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] text-[#4A3F35]"
                        placeholder="+94 77 000 0000"/>
                    </div>
                  </div>
                </div>
              </div>

              {/*address */}
              <div>
                <h4 className="text-sm font-bold text-[#4A3F35] mb-4 flex items-center gap-2">
                  <MapPin size={16} className="text-[#8DAA91]"/> New Officer Address
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Street</label>
                    <input type="text" value={handoverForm.address.street}
                      onChange={e => setHandoverForm({...handoverForm, address: {...handoverForm.address, street: e.target.value}})}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] text-[#4A3F35]"
                      placeholder="Street address"/>
                  </div>
                  {[
                    ['City',        'city',       'e.g. Kurunegala'],
                    ['District',    'district',   'e.g. Kurunegala'],
                    ['Postal Code', 'postalCode', 'e.g. 60000'],
                  ].map(([lbl, key, ph]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-[#4A3F35] mb-2">{lbl}</label>
                      <input type="text" value={handoverForm.address[key]} placeholder={ph}
                        onChange={e => setHandoverForm({...handoverForm, address: {...handoverForm.address, [key]: e.target.value}})}
                        className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] text-[#4A3F35]"/>
                    </div>
                  ))}
                </div>
              </div>

              {/*set new officer password*/}
              <div>
                <h4 className="text-sm font-bold text-[#4A3F35] mb-4 flex items-center gap-2">
                  <Key size={16} className="text-[#8DAA91]"/> Set Account Password
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* current password */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">
                      Your Current Password *
                      <span className="ml-2 text-xs text-[#2E2E2E]/40 font-normal">(required to authorise handover)</span>
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A67C52]"/>
                      <input
                        type={showHandoverPw.current ? 'text' : 'password'}
                        required
                        value={handoverForm.currentPassword}
                        onChange={e => setHandoverForm({...handoverForm, currentPassword: e.target.value})}
                        className="w-full pl-9 pr-11 py-3 border-2 border-[#A67C52]/25 rounded-xl focus:outline-none focus:border-[#A67C52] text-[#4A3F35]"
                        placeholder="Enter your current password"/>
                      <button type="button"
                        onClick={() => setShowHandoverPw(p => ({...p, current: !p.current}))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2E2E2E]/35 hover:text-[#4A3F35]">
                        {showHandoverPw.current ? <EyeOff size={17}/> : <Eye size={17}/>}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">New Password *</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DAA91]"/>
                      <input
                        type={showHandoverPw.new ? 'text' : 'password'}
                        required
                        value={handoverForm.newPassword}
                        onChange={e => setHandoverForm({...handoverForm, newPassword: e.target.value})}
                        className="w-full pl-9 pr-11 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] text-[#4A3F35]"
                        placeholder="Min. 8 characters"/>
                      <button type="button"
                        onClick={() => setShowHandoverPw(p => ({...p, new: !p.new}))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2E2E2E]/35 hover:text-[#4A3F35]">
                        {showHandoverPw.new ? <EyeOff size={17}/> : <Eye size={17}/>}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Confirm Password *</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DAA91]"/>
                      <input
                        type={showHandoverPw.confirm ? 'text' : 'password'}
                        required
                        value={handoverForm.confirmPassword}
                        onChange={e => setHandoverForm({...handoverForm, confirmPassword: e.target.value})}
                        className={`w-full pl-9 pr-11 py-3 border-2 rounded-xl focus:outline-none text-[#4A3F35] ${
                          handoverForm.confirmPassword && handoverForm.newPassword !== handoverForm.confirmPassword
                            ? 'border-red-400 focus:border-red-400'
                            : 'border-[#8DAA91]/20 focus:border-[#8DAA91]'
                        }`}
                        placeholder="Re-enter password"/>
                      <button type="button"
                        onClick={() => setShowHandoverPw(p => ({...p, confirm: !p.confirm}))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2E2E2E]/35 hover:text-[#4A3F35]">
                        {showHandoverPw.confirm ? <EyeOff size={17}/> : <Eye size={17}/>}
                      </button>
                    </div>
                    {handoverForm.confirmPassword && handoverForm.newPassword !== handoverForm.confirmPassword && (
                      <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                    )}
                  </div>
                </div>
              </div>

              {/* email reminder */}
              <div className="flex items-start gap-3 p-4 bg-[#8DAA91]/8 border border-[#8DAA91]/20 rounded-xl">
                <Mail size={16} className="text-[#8DAA91] flex-shrink-0 mt-0.5"/>
                <p className="text-xs text-[#4A3F35]/70 leading-relaxed">
                  <span className="font-semibold">Login email remains: </span>
                  <code className="bg-white px-2 py-0.5 rounded border border-[#8DAA91]/20 font-mono text-[#4A3F35] break-all">
                    {profile?.email}
                  </code>
                  <span className="ml-1">— share this with the new officer along with the current password.</span>
                </p>
              </div>

              {/* buttons*/}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setHandoverModal(false)}
                  className="flex-1 py-3 border-2 border-[#8DAA91] text-[#8DAA91] rounded-xl font-semibold hover:bg-[#8DAA91]/8 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={handoverSaving || !handoverForm.fullName.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#A67C52] to-[#C48A6A] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {handoverSaving ? <RefreshCw size={17} className="animate-spin"/> : <UserCheck size={17}/>}
                  {handoverSaving ? 'Saving...' : 'Complete Handover'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* handovr credential display*/}
      {handoverCredModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#8DAA91]/12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserCheck size={30} className="text-[#8DAA91]"/>
              </div>
              <h2 className="text-2xl font-bold text-[#4A3F35]">Handover Complete!</h2>
              <p className="text-[#2E2E2E]/55 text-sm mt-1">
                Share these credentials with <span className="font-semibold text-[#4A3F35]">{handoverCredModal.name}</span>
              </p>
            </div>

            <div className="bg-[#F4EDE4] rounded-xl p-5 space-y-4 mb-6 border border-[#A67C52]/15">
              {/* email row */}
              <div>
                <p className="text-xs font-semibold text-[#2E2E2E]/45 uppercase tracking-wide mb-1">Login Email</p>
                <div className="flex items-center gap-2">
                  <p className="flex-1 font-semibold text-[#4A3F35] text-sm break-all">{handoverCredModal.email}</p>
                  <button
                    onClick={() => handleHandoverCopy(handoverCredModal.email)}
                    className={`p-2 rounded-lg transition-all flex-shrink-0 ${handoverCopied ? 'bg-[#8DAA91] text-white' : 'bg-[#8DAA91]/15 text-[#8DAA91] hover:bg-[#8DAA91]/30'}`}>
                    {handoverCopied ? <CheckCircle size={15}/> : <Copy size={15}/>}
                  </button>
                </div>
              </div>

              {/* password row */}
              <div>
                <p className="text-xs font-semibold text-[#2E2E2E]/45 uppercase tracking-wide mb-1">New Password</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2.5 rounded-lg font-mono text-[#4A3F35] text-sm border border-[#8DAA91]/20 tracking-widest break-all">
                    {handoverCredModal.password}
                  </code>
                  <button
                    onClick={() => handleHandoverCopy(handoverCredModal.password)}
                    className={`p-2.5 rounded-lg transition-all flex-shrink-0 ${handoverCopied ? 'bg-[#8DAA91] text-white' : 'bg-[#8DAA91]/15 text-[#8DAA91] hover:bg-[#8DAA91]/30'}`}>
                    {handoverCopied ? <CheckCircle size={17}/> : <Copy size={17}/>}
                  </button>
                </div>
              </div>

              {/* copy both button */}
              <button
                onClick={() => handleHandoverCopy(`Email: ${handoverCredModal.email}\nPassword: ${handoverCredModal.password}`)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#8DAA91]/15 text-[#4A6B4A] rounded-lg text-xs font-semibold hover:bg-[#8DAA91]/25 transition-colors">
                <Copy size={13}/> Copy Both
              </button>
            </div>

            <div className="text-center text-xs text-[#2E2E2E]/40 mb-5">
              This window will not show again after closing
            </div>

            <div className="space-y-2">
              <button
                onClick={async () => { setHandoverCredModal(null); await logout(); }}
                className="w-full py-3 bg-gradient-to-r from-[#A67C52] to-[#C48A6A] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <Shield size={16}/> Done &amp; Log Out
              </button>
              <p className="text-center text-xs text-[#2E2E2E]/35">
                The new officer can now log in with the credentials above
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfileSettings;