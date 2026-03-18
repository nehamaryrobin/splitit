import { Link } from 'react-router-dom';
import { AuthBackground } from './LoginPage';
import { SplitSquareHorizontal, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <AuthBackground>
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* nav */}
        <header className="flex items-center px-6 py-5 sm:px-10">
          <Link
            to="/"
            className="flex items-center gap-2 text-[15px] font-black text-slate-900"
            style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.3px' }}
          >
            <SplitSquareHorizontal className="h-5 w-5 text-primary" />
            Split<span className="text-primary">It</span>
          </Link>
        </header>

        {/* content */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          {/* big 404 */}
          <p
            className="text-[120px] font-black leading-none text-slate-100 select-none"
            style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-6px' }}
            aria-hidden
          >
            404
          </p>

          <div className="-mt-4 space-y-3">
            <h1
              className="text-2xl font-black text-slate-900"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Page not found
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Looks like this expense doesn't exist. Maybe it was already settled?
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </main>

        <footer className="py-4 text-center text-xs text-muted-foreground">
          Made with <span className="text-rose-400">♥</span> and cookies by{' '}
          <span className="font-medium text-slate-500">ladyArtemis</span>
        </footer>
      </div>
    </AuthBackground>
  );
}
