import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, SplitSquareHorizontal, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/* ── reusable themed background wrapper ───────────────────── */
export function AuthBackground({ children }) {
  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #f8faff 0%, #eef4ff 35%, #f0fdf8 70%, #fffbeb 100%)',
      }}
    >
      {/* dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.035,
          backgroundImage:
            'radial-gradient(circle, #334155 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* floating blobs */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full"
        style={{
          background:
            'radial-gradient(circle, #bfdbfe 0%, transparent 70%)',
          opacity: 0.45,
          filter: 'blur(40px)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full"
        style={{
          background:
            'radial-gradient(circle, #bbf7d0 0%, transparent 70%)',
          opacity: 0.4,
          filter: 'blur(40px)',
        }}
      />
      <div
        className="pointer-events-none absolute top-1/2 right-1/4 h-48 w-48 rounded-full"
        style={{
          background:
            'radial-gradient(circle, #fef9c3 0%, transparent 70%)',
          opacity: 0.5,
          filter: 'blur(32px)',
        }}
      />
      {children}
    </div>
  );
}

/* ── Google SVG icon ──────────────────────────────────────── */
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

/* ── divider ──────────────────────────────────────────────── */
function Divider({ label = 'or continue with' }) {
  return (
    <div className="relative flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

/* ── main login page ──────────────────────────────────────── */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('reason') === 'session_expired';

  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.email.trim())    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)        e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast({
        title: err?.response?.data?.message || 'Login failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    // Redirect to backend Google OAuth endpoint
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
          No account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </header>

      {/* session expired banner */}
      {sessionExpired && (
        <div className="relative z-10 mx-auto mt-4 w-full max-w-sm rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⏱ Your session expired. Please log in again.
        </div>
      )}

      {/* card */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div
          className="w-full max-w-sm rounded-2xl border border-white/80 bg-white/75 p-8 shadow-xl backdrop-blur-md"
          style={{ animation: 'cardIn 0.45s cubic-bezier(.22,1,.36,1) both' }}
        >
          {/* heading */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <SplitSquareHorizontal className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Log in to your SplitIt account</p>
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <Divider />

          {/* email form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
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
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Logging in…
                </span>
              ) : (
                <>Log in <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          {/* guest link */}
          <p className="mt-5 text-center text-xs text-muted-foreground">
            Just want to try it?{' '}
            <Link to="/guest" className="font-medium text-primary hover:underline">
              Continue without an account
            </Link>
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
