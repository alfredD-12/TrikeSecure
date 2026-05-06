import { useState, useRef } from 'react';
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff, UserPlus, User } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { login, register } from '../services/api';
import LangToggle from '../components/LangToggle';
import '../styles/LoginView.css';

export default function LoginView() {
  const { t, setView, setCurrentUser } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole]         = useState('commuter'); // 'commuter' or 'driver'
  const [fullName, setFullName] = useState('');
  const [fullNameFocused, setFullNameFocused] = useState(false);

  const [email, setEmail]       = useState('');
  const [pass, setPass]         = useState('');
  const [showPass, setShowPass] = useState(false);
  const [confirmPass, setConfirmPass] = useState('');
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPass: '',
    form: '',
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading]   = useState(false);
  const isSubmittingRef = useRef(false);  // ref-based guard prevents race-condition double submits
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused]   = useState(false);
  const [confirmPassFocused, setConfirmPassFocused] = useState(false);

  function clearErrors() {
    setFieldErrors({
      fullName: '',
      email: '',
      password: '',
      confirmPass: '',
      form: '',
    });
  }

  async function handleAction(e) {
    e.preventDefault();
    if (isSubmittingRef.current) return;   // ← stop duplicate submissions immediately
    clearErrors();
    setStatusMessage('');

    if (isRegister) {
      const nextErrors = {
        fullName: '',
        email: '',
        password: '',
        confirmPass: '',
        form: '',
      };

      if (!fullName.trim()) nextErrors.fullName = 'Full name is required.';
      if (!email.trim()) nextErrors.email = 'Email is required.';
      if (!pass) nextErrors.password = 'Password is required.';
      if (!confirmPass) nextErrors.confirmPass = 'Please confirm your password.';

      if (nextErrors.fullName || nextErrors.email || nextErrors.password || nextErrors.confirmPass) {
        setFieldErrors(nextErrors);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setFieldErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
        return;
      }

      if (pass.length < 8 || !/[0-9]/.test(pass) || !/[A-Z]/.test(pass) || !/[^a-zA-Z0-9]/.test(pass)) {
        setFieldErrors((prev) => ({
          ...prev,
          password: 'Use 8+ chars with uppercase, number, and symbol.',
        }));
        return;
      }

      if (pass !== confirmPass) {
        setFieldErrors((prev) => ({ ...prev, confirmPass: 'Passwords do not match.' }));
        return;
      }

      isSubmittingRef.current = true;
      setLoading(true);

      try {
        const normalizedEmail = email.trim().toLowerCase();
        const baseUsername = normalizedEmail.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '') || 'user';
        const username = baseUsername.slice(0, 30);
        const data = await register(fullName.trim(), username, normalizedEmail, pass, role);

        if (data.message === 'User registered successfully.') {
          setIsRegister(false);
          setPass('');
          setConfirmPass('');
          clearErrors();
          setStatusMessage('Account created successfully. Please sign in.');
          isSubmittingRef.current = false;
          setLoading(false);
          return;
        }

        // 409 — email already registered → nudge user to sign in
        const isDuplicate = data.status === 409 ||
          (data.message || '').toLowerCase().includes('already');
        setFieldErrors((prev) => ({
          ...prev,
          form: isDuplicate
            ? 'This email is already registered. Try signing in instead.'
            : (data.message || 'Registration failed.'),
        }));
      } catch {
        setFieldErrors((prev) => ({
          ...prev,
          form: 'Unable to reach the server. Check your network and API URL.',
        }));
      } finally {
        isSubmittingRef.current = false;
        setLoading(false);
      }

      return;
    }

    if (!email.trim() || !pass) {
      setFieldErrors({
        fullName: '',
        email: !email.trim() ? 'Email is required.' : '',
        password: !pass ? 'Password is required.' : '',
        confirmPass: '',
        form: '',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const data = await login(email.trim().toLowerCase(), pass);

      if (data.message === 'Login successful.') {
        if (data.role === 'admin' || data.role === 'lgu') {
          // If an admin accidentally logs in through the mobile app, redirect them
          window.location.href = '/admin';
          return;
        }
        const resolvedRole = data.role === 'driver' ? 'driver' : 'commuter';
        setCurrentUser({
          username: data.username,
          fullName: data.fullName || data.username,
          email: data.email || email.trim().toLowerCase(),
          role: resolvedRole,
        });
        setView(resolvedRole);
        return;
      }

      setFieldErrors((prev) => ({ ...prev, form: data.message || 'Invalid credentials. Please try again.' }));
    } catch {
      setFieldErrors((prev) => ({
        ...prev,
        form: 'Unable to reach the server. Check your network and API URL.',
      }));
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  }

  function socialLogin() {
    setStatusMessage('Social login is coming soon. Please use email and password.');
  }

  const fullNameActive = fullNameFocused || fullName.length > 0;
  const emailActive = emailFocused || email.length > 0;
  const passActive  = passFocused || pass.length > 0;
  const confirmPassActive = confirmPassFocused || confirmPass.length > 0;

  const canSubmit = isRegister
    ? !!fullName.trim() && !!email.trim() && !!pass && !!confirmPass && !loading
    : !!email.trim() && !!pass && !loading;

  // Password strength logic
  const getPasswordScore = () => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;
    return Math.max(1, score);
  };
  const score = getPasswordScore();
  const barWidth = pass.length === 0 ? '0%' : `${(score / 4) * 100}%`;
  const barColor = score <= 1 ? '#ef4444' : score === 2 ? '#f59e0b' : score === 3 ? '#3b82f6' : '#22c55e';

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

      <div className="login-content-wrap flex-1 flex flex-col w-full max-w-sm mx-auto px-6 relative z-10">

        {/* ── Logo — stagger anim 1 ── */}
        <div className="login-anim login-anim--1 flex justify-center mb-3 mt-2 sm:mb-4 sm:mt-6">
          <div>
            <img
              src="/Gemini_Generated_Image_ylicdmylicdmylic-removebg-preview.png"
              alt="TrikeSecure"
              className="h-24 sm:h-28 object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* ── Subtitle — stagger anim 2 ── */}
        <p className="login-anim login-anim--2 text-center text-gray-500 text-sm font-semibold mb-4 sm:mb-6">
          {isRegister ? t('Create a new account') : t('login-subtitle')}
        </p>

        {/* ── Glass Card ── */}
        <div className="login-anim login-anim--3 login-glass-card">
          <form className="space-y-5" onSubmit={handleAction}>

            {/* Smooth Expandable Register Fields */}
            <div className={`login-expandable ${isRegister ? 'is-open' : ''}`}>
              <div className="login-expandable-inner">
                {/* Role Switcher */}
                <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
                  <button
                    type="button"
                    onClick={() => setRole('commuter')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'commuter' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {t('Commuter')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('driver')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'driver' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {t('Trike Rider')}
                  </button>
                </div>

                {/* Full Name */}
                <div className={`login-float-group ${fullNameActive ? 'active' : ''} ${fieldErrors.fullName ? 'has-error' : ''}`}>
                  <User size={18} className="login-float-icon" />
                  <input
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={e => {
                      setFullName(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, fullName: '', form: '' }));
                    }}
                    onFocus={() => setFullNameFocused(true)}
                    onBlur={() => setFullNameFocused(false)}
                    className="login-float-input"
                    id="login-fullname"
                    tabIndex={isRegister ? 0 : -1}
                  />
                  <label htmlFor="login-fullname" className="login-float-label">{t('Full Name')}</label>
                </div>
                {fieldErrors.fullName && <p className="login-field-error">{fieldErrors.fullName}</p>}
              </div>
            </div>

            {/* Email — floating label */}
            <div className={`login-float-group ${emailActive ? 'active' : ''} ${fieldErrors.email ? 'has-error' : ''}`}>
              <Mail size={18} className="login-float-icon" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: '', form: '' }));
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className="login-float-input"
                id="login-email"
              />
              <label htmlFor="login-email" className="login-float-label">{t('Email Address')}</label>
            </div>
            {fieldErrors.email && <p className="login-field-error">{fieldErrors.email}</p>}

            {/* Password — floating label + show/hide */}
            <div>
              <div className={`login-float-group ${passActive ? 'active' : ''} ${fieldErrors.password ? 'has-error' : ''}`}>
                <Lock size={18} className="login-float-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  value={pass}
                  onChange={e => {
                    setPass(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, password: '', form: '' }));
                  }}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  className="login-float-input login-float-input--pass"
                  id="login-pass"
                />
                <label htmlFor="login-pass" className="login-float-label">{t('Password')}</label>
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
              {fieldErrors.password && <p className="login-field-error">{fieldErrors.password}</p>}

              {/* Strength Indicator shows conditionally right under password */}
              <div 
                style={{ 
                  height: isRegister ? 'auto' : '0', 
                  opacity: isRegister ? 1 : 0, 
                  overflow: 'hidden', 
                  transition: 'all 0.3s ease' 
                }}
              >
                <div className="password-strength-container" style={{ marginTop: '8px' }}>
                   <div className="password-strength-bar-bg" style={{ height: '6px', width: '100%', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                      <div className="password-strength-bar-fill" style={{ height: '100%', width: barWidth, backgroundColor: barColor, transition: 'width 0.3s ease, background-color 0.3s ease' }} />
                   </div>
                   <p className="password-hint" style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>{t('Password must be 8+ chars with uppercase, number, and symbol')}</p>
                </div>
              </div>
            </div>

            {/* Expander for Register Password Fields */}
            <div className={`login-expandable ${isRegister ? 'is-open' : ''}`}>
              <div className="login-expandable-inner" style={{ paddingTop: '2px' }}>
                
                {/* Confirm Password */}
                <div className={`login-float-group ${confirmPassActive ? 'active' : ''} ${fieldErrors.confirmPass ? 'has-error' : ''}`}>
                  <Lock size={18} className="login-float-icon" />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPass}
                    onChange={e => {
                      setConfirmPass(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, confirmPass: '', form: '' }));
                    }}
                    onFocus={() => setConfirmPassFocused(true)}
                    onBlur={() => setConfirmPassFocused(false)}
                    className="login-float-input login-float-input--pass"
                    id="login-confirm-pass"
                    tabIndex={isRegister ? 0 : -1}
                  />
                  <label htmlFor="login-confirm-pass" className="login-float-label">{t('Confirm Password')}</label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(v => !v)}
                    className="login-eye-btn"
                    tabIndex={-1}
                  >
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.confirmPass && <p className="login-field-error">{fieldErrors.confirmPass}</p>}
              </div>
            </div>

            <div className="login-status-area" aria-live="polite" aria-atomic="true">
              {fieldErrors.form && <p className="login-error">{fieldErrors.form}</p>}
              {statusMessage && <p className="login-success">{statusMessage}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="login-submit-btn"
            >
              {loading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : isRegister ? (
                <>
                  <UserPlus size={20} />
                  <span>{t('Register')}</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>{t('login-btn')}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                clearErrors();
                setStatusMessage('');
              }}
              className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors"
            >
              {isRegister ? t('Already have an account? Sign in') : t("Don't have an account? Register")}
            </button>
          </div>
        </div>

        {/* ── Divider — stagger anim 4 ── */}
        <div className="login-anim login-anim--4 flex items-center gap-3 my-4 sm:my-6">
          <div className="flex-1 h-px bg-gray-200/60" />
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{t('or continue with')}</span>
          <div className="flex-1 h-px bg-gray-200/60" />
        </div>

        {/* ── Social Buttons — stagger anim 5 ── */}
        <div className="login-anim login-anim--5 flex gap-3 mb-6 sm:mb-10">
          <button
            type="button"
            onClick={socialLogin}
            disabled
            className="login-social-btn"
            title="Coming soon"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.84l6.1-6.1C34.36 3.04 29.45 1 24 1 14.82 1 7.07 6.48 3.72 14.24l7.12 5.53C12.5 13.62 17.77 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.67c-.55 2.97-2.2 5.48-4.67 7.17l7.17 5.57C43.27 37.38 46.52 31.36 46.52 24.5z"/>
              <path fill="#FBBC05" d="M10.84 28.23A14.54 14.54 0 0 1 9.5 24c0-1.47.25-2.9.7-4.23l-7.12-5.53A23.94 23.94 0 0 0 0 24c0 3.87.92 7.53 2.55 10.76l8.29-6.53z"/>
              <path fill="#34A853" d="M24 47c5.45 0 10.02-1.8 13.36-4.9l-7.17-5.57c-1.87 1.26-4.27 2-6.19 2-6.23 0-11.5-4.12-13.16-9.77l-8.29 6.53C7.07 41.52 14.82 47 24 47z"/>
            </svg>
            <span>{t('Google (Soon)')}</span>
          </button>

          <button
            type="button"
            onClick={socialLogin}
            disabled
            className="login-social-btn"
            title="Coming soon"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
            <span>{t('Facebook (Soon)')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
