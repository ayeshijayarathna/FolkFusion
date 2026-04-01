import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdminAuth } from '../../context/Superadminauthcontext';
import {
  RiEyeLine, RiEyeOffLine, RiShieldKeyholeLine,
  RiAlertLine, RiArrowRightLine, RiLockLine,
} from 'react-icons/ri';



export default function SuperAdminLogin() {
  const { login }   = useSuperAdminAuth();
  const navigate    = useNavigate();

  const [form,     setForm]     = useState({ email: '', password: '' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate('/super-admin/dashboard');
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Libre Baskerville', serif" }}
    >
      {/* brand panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* background image */}
        <img
          src="/images/3.jpg"
          alt="FolkFusion heritage"
          className="absolute inset-0 w-full h-full object-cover"
        />


        {/* content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* top logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden">
              <img
                src="/images/logo.png" 
                alt="FolkFusion Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-deep-brown text-[15px] font-bold leading-none" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                FolkFusion
              </p>
              <p className="text-[#C97B5A] text-[9px] tracking-[.22em] mt-0.5">SUPER ADMIN</p>
            </div>
          </div>

          {/* centre quote */}
          <div>
            <div className="w-10 h-0.5 bg-[#C97B5A] mb-6" />
            <h2
              className="text-white text-[34px] font-bold leading-tight mb-4"
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
            >
              Preserving<br />Sri Lanka's<br />Living Heritage
            </h2>
          </div>

          {/* bottom badge */}
          <div className="flex items-center gap-2">
            <RiLockLine size={12} className="text-black" />
            <p className="text-black text-[11px] tracking-wide">
              Restricted access — authorised personnel only
            </p>
          </div>
        </div>
      </div>

      {/* form panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#FAF7F2] px-6 py-12 relative overflow-hidden">

        {/* subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, #3D3530 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* top gradient strip (mobile only) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C97B5A] to-[#7A9E8E] lg:hidden" />

        <div className="relative w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-10 lg:hidden">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C97B5A] to-[#7A9E8E] flex items-center justify-center mb-3 shadow-lg">
              <RiShieldKeyholeLine size={26} className="text-white" />
            </div>
            <p className="text-[#3D3530] text-[16px] font-bold" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
              FolkFusion
            </p>
            <p className="text-[#C97B5A] text-[10px] tracking-[.2em] mt-0.5">SUPER ADMIN PORTAL</p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1
              className="text-[28px] font-bold text-[#3D3530] leading-tight mb-1.5"
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
            >
              Welcome back
            </h1>
            <p className="text-[#9A8880] text-[13px]">Sign in to your super admin account</p>
          </div>

          {/* Form card */}
          <div className="bg-[#FDF6EE] border border-[#E8DDD5] rounded-2xl p-7 shadow-sm">
            <form onSubmit={handleSubmit} noValidate>

              {/* Email */}
              <div className="mb-5">
                <label className="block text-[11px] font-bold text-black uppercase tracking-[.1em] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="superadmin@folkfusion.lk"
                  className="w-full border border-[#E8DDD5] rounded-xl px-4 py-2.5 text-[13px] text-[#3D3530] bg-[#FAF7F2] outline-none focus:border-[#C97B5A] transition-colors box-border placeholder:text-[#C8B9AD]"
                  style={{ fontFamily: "'Libre Baskerville', serif" }}
                />
              </div>

              {/* Password */}
              <div className="mb-6">
                <label className="block text-[11px] font-bold text-black uppercase tracking-[.1em] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full border border-[#E8DDD5] rounded-xl px-4 py-2.5 pr-11 text-[13px] text-[#3D3530] bg-[#FAF7F2] outline-none focus:border-[#C97B5A] transition-colors box-border placeholder:text-[#C8B9AD]"
                    style={{ fontFamily: "'Libre Baskerville', serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A8880] hover:text-[#C97B5A] transition-colors"
                  >
                    {showPass ? <RiEyeOffLine size={17} /> : <RiEyeLine size={17} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-red-700 text-[12px]"
                  style={{ fontFamily: "'Libre Baskerville', serif" }}>
                  <RiAlertLine size={15} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-white font-bold text-[14px] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                style={{
                  background: loading
                    ? '#C97B5A99'
                    : 'linear-gradient(135deg, #C97B5A 0%, #b56a4a 100%)',
                  fontFamily: "'Cinzel Decorative', serif",
                  letterSpacing: '0.04em',
                  boxShadow: loading ? 'none' : '0 4px 18px rgba(201,123,90,0.35)',
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <RiArrowRightLine size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* footer note */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <RiLockLine size={12} className="text-muted-clay" />
            <p className="text-[11px] text-muted-clay">Restricted access — authorised personnel only</p>
          </div>
        </div>
      </div>
    </div>
  );
}