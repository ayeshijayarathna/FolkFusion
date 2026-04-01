import { useState, useEffect } from 'react';
import { superAdminAPI } from '../../../services/api';
import { useSuperAdminAuth } from '../../../context/Superadminauthcontext';
import {
  RiEyeLine, RiEyeOffLine, RiCheckLine, RiAlertLine,
  RiShieldKeyholeLine,
} from 'react-icons/ri';

const inputCls = "w-full border border-[#E8DDD5] rounded-xl px-3 py-2 text-[13px] text-[#3D3530] bg-[#FAF7F2] outline-none focus:border-[#C97B5A] transition-colors box-border";

const PwInput = ({ value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder || '••••••••'}
        className={`${inputCls} pr-10`}
        style={{ fontFamily: "'Libre Baskerville', serif" }}
      />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8880] hover:text-[#3D3530]">
        {show ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
      </button>
    </div>
  );
};

const ToastMsg = ({ msg, type, onDone }) => {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div
      className={`fixed top-5 right-5 z-[9999] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-2xl text-white text-[13px] font-semibold
        ${type === 'error' ? 'bg-red-600' : 'bg-[#3D3530]'}`}
      style={{ fontFamily: "'Libre Baskerville', serif" }}
    >
      {type === 'error' ? <RiAlertLine size={16} /> : <RiCheckLine size={16} />}
      {msg}
    </div>
  );
};

const Field = ({ label, children, required }) => (
  <div className="mb-4">
    <label className="block text-[11px] font-bold text-[#9A8880] uppercase tracking-[.08em] mb-1.5">
      {label}{required && <span className="text-[#C97B5A] ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

export default function SASettings() {
  const { superAdmin } = useSuperAdminAuth();
  const [toast,   setToast]   = useState({ msg: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [form,    setForm]    = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const pwMatch    = form.newPassword && form.confirmPassword && form.newPassword === form.confirmPassword && form.newPassword.length >= 6;
  const pwMismatch = form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword) { setToast({ msg: 'Current password required.', type: 'error' }); return; }
    if (form.newPassword.length < 6) { setToast({ msg: 'New password must be at least 6 characters.', type: 'error' }); return; }
    if (form.newPassword !== form.confirmPassword) { setToast({ msg: 'Passwords do not match.', type: 'error' }); return; }
    if (form.currentPassword === form.newPassword) { setToast({ msg: 'New password must differ from current.', type: 'error' }); return; }
    setLoading(true);
    try {
      const res = await superAdminAPI.changeOwnPassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      if (res.data.token) localStorage.setItem('superAdminToken', res.data.token);
      setToast({ msg: 'Password changed successfully!', type: 'success' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Failed to change password.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const initials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SA';

  return (
    <div>
      <ToastMsg msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: '', type: 'success' })} />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#3D3530] m-0" style={{ fontFamily: "'Cinzel Decorative', serif" }}>Settings</h2>
        <p className="text-[#9A8880] text-[13px] mt-1">Manage your super admin account</p>
      </div>

      <div className="bg-[#FDF6EE] border border-[#E8DDD5] rounded-2xl p-5 mb-6 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C97B5A] to-[#7A9E8E] flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
          {initials(superAdmin?.fullName)}
        </div>
        <div>
          <p className="font-bold text-[#3D3530] text-[15px]">{superAdmin?.fullName || 'Super Administrator'}</p>
          <p className="text-[#9A8880] text-[13px] mt-0.5">{superAdmin?.email}</p>
          <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C97B5A]/15 text-[#C97B5A]">
            Super Admin
          </span>
        </div>
      </div>

      <div className="bg-[#FDF6EE] border border-[#E8DDD5] rounded-2xl shadow-sm" style={{ maxWidth: 480 }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E8DDD5]">
          <RiShieldKeyholeLine size={16} className="text-[#C97B5A]" />
          <h3 className="text-[14px] font-bold text-[#3D3530] m-0" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            Change Password
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5">
          <Field label="Current Password" required>
            <PwInput value={form.currentPassword} onChange={set('currentPassword')} placeholder="Enter current password" />
          </Field>
          <Field label="New Password" required>
            <PwInput value={form.newPassword} onChange={set('newPassword')} placeholder="Min 6 characters" />
          </Field>
          <Field label="Confirm New Password" required>
            <PwInput value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat new password" />
          </Field>

          {pwMismatch && (
            <p className="text-red-500 text-[12px] -mt-2 mb-3 flex items-center gap-1.5">
              <RiAlertLine size={13} /> Passwords do not match
            </p>
          )}
          {pwMatch && (
            <p className="text-[#7A9E8E] text-[12px] -mt-2 mb-3 flex items-center gap-1.5">
              <RiCheckLine size={13} /> Passwords match
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#C97B5A] text-white rounded-xl text-[13px] font-semibold hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer"
            style={{ fontFamily: "'Libre Baskerville', serif" }}
          >
            {loading ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}