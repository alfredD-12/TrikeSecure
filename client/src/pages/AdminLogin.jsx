import { useState, useEffect } from 'react';
import { Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Sun, Moon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { login } from '../services/api';
import LangToggle from '../components/LangToggle';
import '../styles/LoginView.css';

export default function AdminLogin() {
  const { setView, setCurrentUser, darkMode, toggleDarkMode, t } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dm = darkMode;

  useEffect(() => {
    document.title = "TrikeSecure Admin Portal";
    return () => { document.title = "TrikeSecure"; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(email, password);
      // Ensure only admins can log in
      if (res.message === 'Login successful.') {
        if (res.role !== 'admin') {
          setError('Unauthorized. Only administrators can access this portal.');
          setIsLoading(false);
          return;
        }
        setCurrentUser(res);
        setView('admin-dashboard');
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const emailActive = emailFocused || email.length > 0;
  const passActive  = passFocused || password.length > 0;

  return (
    <div className={`login-root fixed inset-0 z-[100] flex flex-col overflow-y-auto transition-colors duration-300 ${dm ? 'bg-gray-900' : 'bg-slate-100'}`} style={{ background: dm ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)' }}>

      {/* ── Gradient background blobs (dark only) ── */}
      {dm && (
        <div className="login-bg-blobs" aria-hidden="true">
          <div className="login-blob login-blob--red opacity-40 blur-[130px]" />
          <div className="login-blob login-blob--blue opacity-30 blur-[110px]" />
        </div>
      )}

      {/* Top Controls */}
      <div className="fixed top-4 right-4 z-20 flex items-center gap-3">
        <button
          onClick={toggleDarkMode}
          className={`p-2.5 rounded-xl backdrop-blur-md transition-all ${dm ? 'bg-white/10 text-yellow-400 hover:bg-white/20' : 'bg-black/5 text-gray-600 hover:bg-black/10'}`}
          title={dm ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {dm ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <LangToggle />
      </div>

      <div className="login-content-wrap flex-1 flex flex-col w-full max-w-sm mx-auto px-6 relative z-10 justify-center">

        {/* ── Logo — stagger anim 1 ── */}
        <div className="login-anim login-anim--1 flex justify-center mb-0 mt-2 sm:mb-2 sm:mt-6">
          <div>
            <img
              src="/Gemini_Generated_Image_ylicdmylicdmylic-removebg-preview.png"
              alt="TrikeSecure"
              className="h-28 sm:h-32 object-contain drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            />
          </div>
        </div>

        {/* ── Titles ── */}
        <div className="login-anim login-anim--2 text-center mb-8">
          <h2 className={`text-3xl font-black tracking-tight uppercase ${dm ? 'text-white' : 'text-gray-900'}`}>Admin Portal</h2>
          <p className={`text-sm font-bold tracking-wide mt-1 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
            Secure Management System
          </p>
        </div>

        {/* ── Glass Card ── */}
        <div className="login-anim login-anim--3 login-glass-card !shadow-2xl transition-colors duration-300" style={{ background: dm ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.85)', border: `1px solid ${dm ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
          
          {error && (
            <div className="mb-6 bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start backdrop-blur-md">
              <AlertCircle size={20} className={`mt-0.5 shrink-0 ${dm ? 'text-red-400' : 'text-red-500'}`} />
              <p className={`ml-3 text-sm font-bold ${dm ? 'text-red-200' : 'text-red-700'}`}>{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Email — floating label */}
            <div className={`login-float-group ${emailActive ? 'active' : ''} ${error ? 'has-error' : ''}`} style={!dm ? { background: 'rgba(241,245,249,0.8)', border: '1px solid rgba(0,0,0,0.08)' } : {}}>
              <Mail size={18} className={`login-float-icon ${dm ? '!text-gray-400' : '!text-gray-500'}`} />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError('');
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className={`login-float-input ${dm ? '!bg-white/5 !text-white !border-white/20' : '!bg-transparent !text-gray-900 !border-gray-200'} focus:!border-red-500`}
                id="admin-email"
              />
              <label htmlFor="admin-email" className={`login-float-label ${dm ? '!text-gray-400' : '!text-gray-500'}`}>Administrator Email</label>
            </div>

            {/* Password — floating label + show/hide */}
            <div style={!dm ? { background: 'rgba(241,245,249,0.8)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px' } : {}}>
              <div className={`login-float-group ${passActive ? 'active' : ''} ${error ? 'has-error' : ''}`}>
                <Lock size={18} className={`login-float-icon ${dm ? '!text-gray-400' : '!text-gray-500'}`} />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  className={`login-float-input login-float-input--pass ${dm ? '!bg-white/5 !text-white !border-white/20' : '!bg-transparent !text-gray-900 !border-gray-200'} focus:!border-red-500`}
                  id="admin-pass"
                />
                <label htmlFor="admin-pass" className={`login-float-label ${dm ? '!text-gray-400' : '!text-gray-500'}`}>Master Password</label>
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className={`login-eye-btn ${dm ? '!text-gray-400 hover:!text-white' : '!text-gray-400 hover:!text-gray-900'}`}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="login-submit-btn w-full group overflow-hidden relative"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                {isLoading ? (
                  <span className="flex items-center justify-center relative z-10">
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center relative z-10 uppercase tracking-widest text-[13px]">
                    Secure Login
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Return Button */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => setView('login')}
              className={`text-sm font-bold transition-colors flex items-center justify-center mx-auto ${dm ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
            >
              <ArrowRight size={14} className="mr-2 rotate-180" />
              Return to TrikeSecure Gateway
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
