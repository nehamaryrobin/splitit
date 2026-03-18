import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthBackground } from './LoginPage';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [error, setError]   = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const err    = params.get('error');

    if (err) {
      setError('Google sign-in failed. Please try again.');
      setTimeout(() => navigate('/login', { replace: true }), 2500);
      return;
    }

    if (token) {
      localStorage.setItem('accessToken', token);
      // Strip token from URL immediately for security
      window.history.replaceState({}, '', '/auth/callback');
      navigate('/dashboard', { replace: true });
    } else {
      setError('No token received. Redirecting to login…');
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    }
  }, []);

  return (
    <AuthBackground>
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          {error ? (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <span className="text-destructive text-xl">✕</span>
              </div>
              <p className="text-sm text-muted-foreground">{error}</p>
            </>
          ) : (
            <>
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Signing you in…</p>
            </>
          )}
        </div>
      </div>
    </AuthBackground>
  );
}
