import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, SplitSquareHorizontal, ArrowRight, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthBackground } from './LoginPage';

/* ── password strength meter ─────────────────────────────── */
function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter',  ok: /[A-Z]/.test(password) },
    { label: 'One number',            ok: /\d/.test(password) },
  ];
  const passed = checks.filter((c) => c.ok).length;
  const colors = ['', '#ef4444', '#f59e0b', '#22c55e'];
  const labels = ['', 'Weak', 'Fair', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* bar */}
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= passed ? colors[passed] : '#e2e8f0' }}
          />
        ))}
      </div>
      {/* label */}
      <p className="text-xs font-medium" style={{ color: colors[passed] }}>
        {labels[passed]}
      </p>
      {/* checklist */}
      <ul className="space-y-0.5">
        {checks.map(({ label, ok }) => (
          <li key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {ok
              ? <Check className="h-3 w-3 text-green-500" />
              : <X    className="h-3 w-3 text-slate-300" />}
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Google icon ──────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

function Divider() {
  return (
    <div className="relative flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground whitespace-nowrap">or continue with</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

/* ── main register page ───────────────────────────────────── */
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.email.trim())   e.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast({ title: `Welcome, ${form.name}! 🎉` });
      navigate('/dashboard');
    } catch (err) {
      toast({
        title: err?.response?.data?.message || 'Registration failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || '/api/v1'}/auth/google`;
  };

  return (
    <AuthBackground>
      {/* top nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-800 text-[15px]">
          <SplitSquareHorizontal className="h-5 w-5 text-primary" />
          SplitIt
        </Link>
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </header>

      {/* card */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        <div
          className="w-full max-w-sm rounded-2xl border border-white/80 bg-white/75 p-8 shadow-xl backdrop-blur-md"
          style={{ animation: 'cardIn 0.45s cubic-bezier(.22,1,.36,1) both' }}
        >
          {/* heading */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <SplitSquareHorizontal className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Create your account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Save trips, track history, settle up
            </p>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
          >
            <GoogleIcon />
            Sign up with Google
          </button>

          <Divider />

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {/* name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="Neha Sharma"
                autoComplete="name"
                value={form.name}
                onChange={set('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={set('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={set('password')}
                  className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShow(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              <PasswordStrength password={form.password} />
            </div>

            {/* confirm */}
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={form.confirm}
                onChange={set('confirm')}
                className={errors.confirm ? 'border-destructive' : ''}
              />
              {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
            </div>

            <Button type="submit" className="w-full gap-2 mt-1" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account…
                </span>
              ) : (
                <>Create account <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          {/* terms */}
          <p className="mt-4 text-center text-xs text-muted-foreground leading-relaxed">
            By signing up you agree to our{' '}
            <a href="#" className="text-primary hover:underline">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </main>

      {/* footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-400">
        Made with{' '}
        <span style={{ color: '#fb7185' }}>♥</span>
        {' '}and cookies by{' '}
        <span className="font-medium text-slate-500">ladyArtemis</span>
      </footer>

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </AuthBackground>
  );
}
