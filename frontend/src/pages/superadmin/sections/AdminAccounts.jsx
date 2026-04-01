import { useState, useEffect, useCallback } from 'react';
import { superAdminAPI } from '../../../services/api';
import { PROVINCES } from '../../../utils/constants';
import {
  RiAddLine, RiRefreshLine, RiKeyLine, RiDeleteBinLine,
  RiEyeLine, RiEyeOffLine, RiFileCopyLine, RiCheckLine,
  RiAlertLine, RiCloseLine, RiShieldCheckLine,
} from 'react-icons/ri';
//private components
const PageTitle = ({ title, subtitle }) => (
  <div className="mb-0">
    <h2 className="text-xl font-bold text-[#3D3530] m-0" style={{ fontFamily: "'Cinzel Decorative', serif" }}>{title}</h2>
    {subtitle && <p className="text-[#9A8880] text-[13px] mt-1">{subtitle}</p>}
  </div>
);

const Badge = ({ children, color }) => (
  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold" style={{ background: color + '20', color }}>
    {children}
  </span>
);

const Btn = ({ children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', className = '' }) => {
  const styles = {
    primary: 'bg-[#C97B5A] text-white hover:opacity-90',
    danger:  'bg-red-100 text-red-600 border border-red-200 hover:bg-red-200',
    ghost:   'bg-[#FAF7F2] text-[#9A8880] border border-[#E8DDD5] hover:bg-[#F0EAE2]',
    sage:    'bg-[#7A9E8E]/15 text-[#7A9E8E] border border-[#7A9E8E]/30 hover:bg-[#7A9E8E]/25',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-xl font-semibold transition-all cursor-pointer
        ${size === 'sm' ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-[13px]'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : styles[variant]}
        ${className}`}
      style={{ fontFamily: "'Libre Baskerville', serif" }}
    >
      {children}
    </button>
  );
};

const Modal = ({ open, onClose, title, children, width = 480 }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-[#FDF6EE] rounded-2xl shadow-2xl border border-[#E8DDD5] w-full overflow-y-auto"
        style={{ maxWidth: width, maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DDD5]">
          <h3 className="text-[14px] font-bold text-[#3D3530] m-0" style={{ fontFamily: "'Cinzel Decorative', serif" }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#E8DDD5] transition-colors text-[#9A8880]">
            <RiCloseLine size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
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

const inputCls = "w-full border border-[#E8DDD5] rounded-xl px-3 py-2 text-[13px] text-[#3D3530] bg-[#FAF7F2] outline-none focus:border-[#C97B5A] transition-colors box-border";

const TextInput = (props) => <input className={inputCls} style={{ fontFamily: "'Libre Baskerville', serif" }} {...props} />;

const SelectInput = ({ children, ...props }) => (
  <select className={inputCls} style={{ fontFamily: "'Libre Baskerville', serif" }} {...props}>{children}</select>
);

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
      <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8880] hover:text-[#3D3530]">
        {show ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
      </button>
    </div>
  );
};

const CopyBox = ({ value, highlight }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E8DDD5] rounded-xl px-3 py-2">
      <span className="flex-1 text-[13px] font-mono break-all" style={{ color: highlight ? '#C97B5A' : '#3D3530', fontWeight: highlight ? 700 : 400 }}>
        {value}
      </span>
      <button type="button" onClick={copy} className="text-[#9A8880] hover:text-[#C97B5A] transition-colors flex-shrink-0">
        {copied ? <RiCheckLine size={16} className="text-[#7A9E8E]" /> : <RiFileCopyLine size={16} />}
      </button>
    </div>
  );
};

const Toast = ({ msg, type, onDone }) => {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-2xl text-white text-[13px] font-semibold
      ${type === 'error' ? 'bg-red-600' : 'bg-[#3D3530]'}`}
      style={{ fontFamily: "'Libre Baskerville', serif" }}>
      {type === 'error' ? <RiAlertLine size={16} /> : <RiCheckLine size={16} />}
      {msg}
    </div>
  );
};

//Admin accounts
export default function AdminAccounts() {
  const [admins,       setAdmins]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState({ msg: '', type: 'success' });
  const [createOpen,   setCreateOpen]   = useState(false);
  const [resetTarget,  setResetTarget]  = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [createdCreds, setCreatedCreds] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', province: '', fullName: '', phoneNumber: '' });
  const [resetPw,  setResetPw]  = useState('');

  const notify = useCallback((msg, type = 'success') => setToast({ msg, type }), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await superAdminAPI.getAllAdmins();
      setAdmins(res.data.data || []);
    } catch {
      notify('Failed to load admin accounts.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    const { email, password, province, fullName } = newAdmin;
    if (!email || !password || !province || !fullName) {
      notify('Email, password, province and name are required.', 'error'); return;
    }
    setActionLoading(true);
    try {
      await superAdminAPI.createAdmin(newAdmin);
      setCreatedCreds({ email, password, province, fullName });
      setCreateOpen(false);
      setNewAdmin({ email: '', password: '', province: '', fullName: '', phoneNumber: '' });
      load();
    } catch (e) {
      notify(e.response?.data?.message || 'Failed to create admin.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await superAdminAPI.toggleAdminActive(id);
      notify(res.data.message || 'Status updated.');
      setAdmins(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
    } catch {
      notify('Failed to update status.', 'error');
    }
  };

  const handleReset = async () => {
    if (!resetPw || resetPw.length < 6) { notify('Minimum 6 characters required.', 'error'); return; }
    setActionLoading(true);
    try {
      await superAdminAPI.resetAdminPassword(resetTarget.id, { newPassword: resetPw });
      notify(`Password reset for ${resetTarget.email}`);
      setResetTarget(null);
      setResetPw('');
    } catch {
      notify('Failed to reset password.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await superAdminAPI.deleteAdmin(deleteTarget.id);
      notify('Admin account deleted.');
      setDeleteTarget(null);
      load();
    } catch {
      notify('Failed to delete admin.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: '', type: 'success' })} />

      {/* header */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <PageTitle title="Admin Accounts" subtitle={`${admins.length} provincial admin${admins.length !== 1 ? 's' : ''} registered`} />
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={load}><RiRefreshLine size={14} /></Btn>
          <Btn onClick={() => setCreateOpen(true)}><RiAddLine size={14} /> Add Admin</Btn>
        </div>
      </div>

      {/* list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-9 h-9 rounded-full border-4 border-[#C97B5A]/20 border-t-[#C97B5A] animate-spin" />
        </div>
      ) : admins.length === 0 ? (
        <div className="text-center py-16 text-[#9A8880]">
          <RiShieldCheckLine size={44} className="mx-auto mb-3 opacity-30" />
          <p className="text-[15px] font-bold text-[#3D3530] mb-1" style={{ fontFamily: "'Cinzel Decorative', serif" }}>No admins found</p>
          <p className="text-[13px]">Create the first provincial admin account.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {admins.map(admin => (
            <div key={admin.id} className="bg-[#FDF6EE] border border-[#E8DDD5] rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#C97B5A]/30 to-[#7A9E8E]/30 flex items-center justify-center">
                {admin.profilePhoto
                  ? <img src={admin.profilePhoto} alt="" className="w-full h-full object-cover" />
                  : <span className="text-[#3D3530] font-bold text-sm">
                      {(admin.fullName || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                }
              </div>

              {/* info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-[#3D3530] text-[14px]">{admin.fullName || '(No name)'}</span>
                  <Badge color={admin.isActive ? '#7A9E8E' : '#9CA3AF'}>{admin.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                <p className="text-[12px] text-[#9A8880] truncate">
                  {admin.email}
                  {admin.province && <> &bull; <span className="text-[#C97B5A] font-semibold">{admin.province}</span></>}
                  {admin.phoneNumber && <> &bull; {admin.phoneNumber}</>}
                </p>
              </div>

              {/* actions */}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <Btn size="sm" variant={admin.isActive ? 'ghost' : 'sage'} onClick={() => handleToggle(admin.id)}>
                  {admin.isActive ? 'Deactivate' : 'Activate'}
                </Btn>
                <Btn size="sm" variant="ghost" onClick={() => { setResetTarget({ id: admin.id, email: admin.email, province: admin.province }); setResetPw(''); }}>
                  <RiKeyLine size={12} /> Reset PW
                </Btn>
                <Btn size="sm" variant="danger" onClick={() => setDeleteTarget({ id: admin.id, email: admin.email })}>
                  <RiDeleteBinLine size={12} />
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {/*create model */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Provincial Admin">
        <Field label="Full Name" required>
          <TextInput type="text" value={newAdmin.fullName} onChange={e => setNewAdmin({ ...newAdmin, fullName: e.target.value })} placeholder="Western Province Admin" />
        </Field>
        <Field label="Email Address" required>
          <TextInput type="email" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} placeholder="admin.western@folkfusion.lk" />
        </Field>
        <Field label="Password" required>
          <PwInput value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} placeholder="Min 6 characters" />
        </Field>
        <Field label="Province" required>
          <SelectInput value={newAdmin.province} onChange={e => setNewAdmin({ ...newAdmin, province: e.target.value })}>
            <option value="">Select province…</option>
            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </SelectInput>
        </Field>
        <Field label="Phone Number">
          <TextInput type="text" value={newAdmin.phoneNumber} onChange={e => setNewAdmin({ ...newAdmin, phoneNumber: e.target.value })} placeholder="+94 77 000 0000" />
        </Field>
        <div className="flex gap-2 mt-2">
          <Btn onClick={handleCreate} disabled={actionLoading}>{actionLoading ? 'Creating…' : 'Create Admin'}</Btn>
          <Btn variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Btn>
        </div>
      </Modal>

      {/*created credentials */}
      <Modal open={!!createdCreds} onClose={() => setCreatedCreds(null)} title="Admin Created — Save Credentials">
        {createdCreds && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <p className="text-[12px] font-bold text-green-800 mb-3">{createdCreds.province} Province &bull; {createdCreds.fullName}</p>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-[#9A8880] font-bold uppercase tracking-[.08em] mb-1">Email</p>
                  <CopyBox value={createdCreds.email} />
                </div>
                <div>
                  <p className="text-[10px] text-[#9A8880] font-bold uppercase tracking-[.08em] mb-1">Password</p>
                  <CopyBox value={createdCreds.password} highlight />
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-[12px] text-yellow-800">
              <RiAlertLine size={13} className="inline mr-1" />
              Share these credentials with the admin and ask them to change the password on first login.
            </div>
            <div className="flex gap-2">
              <Btn onClick={() => {
                navigator.clipboard.writeText(`Province: ${createdCreds.province}\nEmail: ${createdCreds.email}\nPassword: ${createdCreds.password}`);
                notify('Credentials copied!');
              }}>
                <RiFileCopyLine size={13} /> Copy All
              </Btn>
              <Btn variant="sage" onClick={() => setCreatedCreds(null)}>Done</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/*reset password */}
      <Modal open={!!resetTarget} onClose={() => setResetTarget(null)} title="Reset Admin Password">
        {resetTarget && (
          <div>
            <div className="bg-[#FAF7F2] border border-[#E8DDD5] rounded-xl p-3 mb-4">
              <p className="text-[11px] text-[#9A8880] mb-0.5">Resetting password for</p>
              <p className="text-[13px] font-bold text-[#3D3530]">{resetTarget.email}</p>
              <p className="text-[#C97B5A] text-[12px]">{resetTarget.province} Province</p>
            </div>
            <Field label="New Password" required>
              <PwInput value={resetPw} onChange={e => setResetPw(e.target.value)} placeholder="Min 6 characters" />
            </Field>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-[12px] text-yellow-800">
              The admin will be logged out after the password is reset. Share the new password with them.
            </div>
            <div className="flex gap-2">
              <Btn onClick={handleReset} disabled={actionLoading}>{actionLoading ? 'Resetting…' : 'Reset Password'}</Btn>
              <Btn variant="ghost" onClick={() => setResetTarget(null)}>Cancel</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete" width={420}>
        {deleteTarget && (
          <div>
            <p className="text-[13px] text-[#3D3530] leading-relaxed mb-4">
              Are you sure you want to delete <strong>{deleteTarget.email}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Btn variant="danger" onClick={handleDelete} disabled={actionLoading}>
                <RiDeleteBinLine size={13} />
                {actionLoading ? 'Deleting…' : 'Yes, Delete'}
              </Btn>
              <Btn variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}