import { useState } from 'react';
import { Phone, Lock, LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import LangToggle from '../components/LangToggle';
import '../styles/LoginView.css';

// Test accounts (phone → role)
const ACCOUNTS = {
  '1': { password: 'pass', role: 'driver' },
  '2': { password: 'pass', role: 'commuter' },
};

export default function LoginView() {
  const { t, setView } = useApp();
  const [phone, setPhone]       = useState('');
  const [pass, setPass]         = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState(false);
  const [loading, setLoading]   = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passFocused, setPassFocused]   = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    const account = ACCOUNTS[phone.trim()];
    if (!account || account.password !== pass) {
      setError(true);
      return;
    }
    setError(false);
    setLoading(true);
    // Simulate brief loading for polished feel
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setView(account.role);
  }

  function socialLogin() {
    setView('commuter');
  }

  const phoneActive = phoneFocused || phone.length > 0;
  const passActive  = passFocused || pass.length > 0;

  return (
    <div className="login-root fixed inset-0 z-[100] flex flex-col overflow-y-auto">

      {/* ── Gradient background blobs ── */}
      <div className="login-bg-blobs" aria-hidden="true">
        <div className="login-blob login-blob--red" />
        <div className="login-blob login-blob--blue" />
        <div className="login-blob login-blob--orange" />
      </div>

      {/* Language Toggle */}
      <div className="login-lang-toggle">
        <LangToggle />
      </div>

      <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto px-6 py-8 relative z-10">

        {/* ── Logo — stagger anim 1 ── */}
        <div className="login-anim login-anim--1 flex justify-center mb-4 mt-6">
          <div className="login-logo-glow">
            <img
              src="/Gemini_Generated_Image_ylicdmylicdmylic-removebg-preview.png"
              alt="TrikeSecure"
              className="h-28 object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* ── Subtitle — stagger anim 2 ── */}
        <p className="login-anim login-anim--2 text-center text-gray-500 text-sm font-semibold mb-8">
          {t('login-subtitle')}
        </p>

        {/* ── Glass Card ── */}
        <div className="login-anim login-anim--3 login-glass-card">
          <form className="space-y-5" onSubmit={handleLogin}>

            {/* Phone — floating label */}
            <div className={`login-float-group ${phoneActive ? 'active' : ''} ${error ? 'has-error' : ''}`}>
              <Phone size={18} className="login-float-icon" />
              <input
                type="tel"
                autoComplete="username"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError(false); }}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                className="login-float-input"
                id="login-phone"
              />
              <label htmlFor="login-phone" className="login-float-label">Mobile Number</label>
            </div>

            {/* Password — floating label + show/hide */}
            <div className={`login-float-group ${passActive ? 'active' : ''} ${error ? 'has-error' : ''}`}>
              <Lock size={18} className="login-float-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={pass}
                onChange={e => { setPass(e.target.value); setError(false); }}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                className="login-float-input login-float-input--pass"
                id="login-pass"
              />
              <label htmlFor="login-pass" className="login-float-label">Password</label>
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="login-eye-btn"
                tabIndex={-1}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <p className="login-error">
                Invalid credentials. Please try again.
              </p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              {loading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  <span>{t('login-btn')}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Divider — stagger anim 4 ── */}
        <div className="login-anim login-anim--4 flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200/60" />
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">or continue with</span>
          <div className="flex-1 h-px bg-gray-200/60" />
        </div>

        {/* ── Social Buttons — stagger anim 5 ── */}
        <div className="login-anim login-anim--5 flex gap-3 mb-10">
          <button
            type="button"
            onClick={socialLogin}
            className="login-social-btn"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.84l6.1-6.1C34.36 3.04 29.45 1 24 1 14.82 1 7.07 6.48 3.72 14.24l7.12 5.53C12.5 13.62 17.77 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.67c-.55 2.97-2.2 5.48-4.67 7.17l7.17 5.57C43.27 37.38 46.52 31.36 46.52 24.5z"/>
              <path fill="#FBBC05" d="M10.84 28.23A14.54 14.54 0 0 1 9.5 24c0-1.47.25-2.9.7-4.23l-7.12-5.53A23.94 23.94 0 0 0 0 24c0 3.87.92 7.53 2.55 10.76l8.29-6.53z"/>
              <path fill="#34A853" d="M24 47c5.45 0 10.02-1.8 13.36-4.9l-7.17-5.57c-1.87 1.26-4.27 2-6.19 2-6.23 0-11.5-4.12-13.16-9.77l-8.29 6.53C7.07 41.52 14.82 47 24 47z"/>
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={socialLogin}
            className="login-social-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
            <span>Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
}
