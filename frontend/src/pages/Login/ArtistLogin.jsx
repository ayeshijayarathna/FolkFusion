import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ArtistLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        if (result.user.role === 'artist') {
          navigate('/artist/dashboard');
        } else {
          setError('Invalid credentials. Artists only.');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 font-body relative"
      style={{
        backgroundImage: "url('/images/arlogin1.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* back button */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-white hover:text-[#C97B5A] transition-colors z-30 text-sm font-medium bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
      >
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      {/* outer glass card  */}
      <div
        className="relative z-10 w-full max-w-4xl rounded-3xl overflow-visible flex animate-scaleIn"
        style={{
          minHeight: '520px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.25)',
          border: '1px solid rgba(255,255,255,0.22)',
        }}
      >

        {/* left-glass form panel */}
        <div
          className="hidden md:block relative rounded-l-3xl overflow-visible"
          style={{ width: '46%', flexShrink: 0 }}
        >
          <div
            className="absolute inset-0 rounded-l-3xl overflow-hidden"
            style={{
              backgroundImage: "url('/images/login Artist.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div
            className="absolute inset-0 rounded-l-3xl"
            style={{ backdropFilter: 'blur(1px)' }}
          />
          <div
            className="absolute top-0 right-0 w-44 h-44 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.10)', transform: 'translate(30%, -30%)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(-30%, 30%)' }}
          />

          {/* artist image */}
          <div
            className="absolute bottom-0 z-20"
            style={{
              right: '-22%',
              width: '120%',
              maxWidth: '380px',
              filter: 'drop-shadow(16px 0 32px rgba(0,0,0,0.30))',
            }}
          >
            <img
              src="/images/artistlogin.png"
              alt="Artist"
              className="w-full h-auto object-contain"
              style={{ maxHeight: '490px', objectPosition: 'bottom' }}
            />
          </div>

          <div className="absolute bottom-8 left-8 z-10">
            <p className="text-dark-brown font-heading text-lg drop-shadow">FolkFusion</p>
            <p className="text-muted-clay text-[10px] tracking-widest uppercase mt-0.5">Artist Portal</p>
            <div className="flex gap-1.5 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-clay/80" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-clay/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-clay/20" />
            </div>
          </div>
        </div>

        {/* right-glass form panel */}
        <div
          className="flex-1 rounded-r-3xl rounded-l-3xl md:rounded-l-none flex flex-col justify-center items-center px-10 py-12 relative z-10"
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderLeft: '1px solid rgba(255,255,255,0.20)',
          }}
        >
          {/* logo*/}
          <div className="flex justify-center mb-4">
            <div
              className="w-20 h-20 rounded-full overflow-hidden"
              style={{
                boxShadow: '0 4px 24px rgba(0,0,0,0.22), 0 0 0 3px rgba(255,255,255,0.30)',
              }}
            >
              <img src="/images/logo.png" alt="FolkFusion Logo" className="w-full h-full object-cover" />
            </div>
          </div>

          <p className="text-[#C97B5A] text-[11px] font-semibold tracking-widest uppercase mb-1 drop-shadow text-center">
            Welcome back!
          </p>
          <h1 className="text-[2.5rem] font-heading text-white mb-7 leading-tight drop-shadow-lg text-center">
            Artist Login
          </h1>

          {error && (
            <div className="w-full mb-5 px-4 py-3 bg-red-500/20 border border-red-300/40 rounded-xl text-white text-sm animate-fadeIn">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 w-full">
            <div>
              <label className="block text-[11px] font-semibold text-dark-brown/80 mb-1.5 uppercase tracking-widest">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C97B5A]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="login@mail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-[#3D3530] placeholder-[#3D3530]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#C97B5A]/50 transition-all"
                  style={{ background: 'rgba(253,246,238,0.82)', border: '1.5px solid rgba(255,255,255,0.35)' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-semibold text-dark-brown/80 uppercase tracking-widest">
                  Password
                </label>
                <button type="button" className="text-xs text-[#C97B5A] hover:text-white transition-colors">
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C97B5A]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-[#3D3530] placeholder-[#3D3530]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#C97B5A]/50 transition-all"
                  style={{ background: 'rgba(253,246,238,0.82)', border: '1.5px solid rgba(255,255,255,0.35)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C97B5A] hover:text-[#3D3530] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm tracking-widest uppercase text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #C97B5A 0%, #C4917A 100%)',
                boxShadow: '0 6px 24px rgba(201,123,90,0.45)',
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Login
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-dark-brown/50 mt-6">
            New artist?{' '}
            <span className="text-[#C97B5A] font-medium cursor-pointer hover:underline">
              Contact your provincial council to register.
            </span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default ArtistLogin;