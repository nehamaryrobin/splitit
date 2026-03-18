import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';

/* ── tiny hook: staggered mount ───────────────────────────── */
function useStagger(count, delay = 120) {
  const [visible, setVisible] = useState([]);
  useEffect(() => {
    let i = 0;
    const tick = () => {
      setVisible((v) => [...v, i]);
      i++;
      if (i < count) setTimeout(tick, delay);
    };
    const t = setTimeout(tick, 180);
    return () => clearTimeout(t);
  }, [count, delay]);
  return visible;
}

/* ── SVG illustration: expense cards + donut ─────────────── */
function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 780 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-2xl mx-auto"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fadeBottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="cardGrad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0f7ff" />
          <stop offset="100%" stopColor="#e6f1fb" />
        </linearGradient>
        <linearGradient id="cardGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0fdf4" />
          <stop offset="100%" stopColor="#dcfce7" />
        </linearGradient>
        <linearGradient id="cardGrad3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fefce8" />
          <stop offset="100%" stopColor="#fef9c3" />
        </linearGradient>
        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0000001a" />
        </filter>
        <clipPath id="donutClip">
          <circle cx="580" cy="195" r="95" />
        </clipPath>
      </defs>

      {/* ── background blobs ─────────────────────────────── */}
      <ellipse cx="580" cy="200" rx="155" ry="155" fill="#eff6ff" opacity="0.7" />
      <ellipse cx="160" cy="210" rx="120" ry="100" fill="#f0fdf4" opacity="0.6" />

      {/* ── expense card 1: Dinner ────────────────────────── */}
      <g filter="url(#cardShadow)" style={{ animation: 'floatA 5s ease-in-out infinite' }}>
        <rect x="40" y="60" width="240" height="96" rx="14" fill="url(#cardGrad1)" />
        <rect x="40" y="60" width="240" height="96" rx="14" stroke="#bfdbfe" strokeWidth="1" />
        {/* label */}
        <text x="62" y="92" fontFamily="'DM Sans', sans-serif" fontSize="13" fontWeight="600" fill="#1e3a5f">Dinner at Coastal</text>
        <text x="62" y="112" fontFamily="'DM Sans', sans-serif" fontSize="11" fill="#64748b">Paid by Neha</text>
        {/* amount */}
        <text x="228" y="92" fontFamily="'DM Sans', sans-serif" fontSize="14" fontWeight="700" fill="#185fa5" textAnchor="end">₹2,400</text>
        {/* split pills */}
        <rect x="62" y="122" width="46" height="18" rx="9" fill="#dbeafe" />
        <text x="85" y="134" fontFamily="'DM Sans', sans-serif" fontSize="9" fill="#1d4ed8" textAnchor="middle">Neha</text>
        <rect x="114" y="122" width="46" height="18" rx="9" fill="#dbeafe" />
        <text x="137" y="134" fontFamily="'DM Sans', sans-serif" fontSize="9" fill="#1d4ed8" textAnchor="middle">Jovial</text>
        <rect x="166" y="122" width="38" height="18" rx="9" fill="#dbeafe" />
        <text x="185" y="134" fontFamily="'DM Sans', sans-serif" fontSize="9" fill="#1d4ed8" textAnchor="middle">Izza</text>
      </g>

      {/* ── expense card 2: Cab ───────────────────────────── */}
      <g filter="url(#cardShadow)" style={{ animation: 'floatB 6s ease-in-out infinite' }}>
        <rect x="60" y="182" width="240" height="88" rx="14" fill="url(#cardGrad2)" />
        <rect x="60" y="182" width="240" height="88" rx="14" stroke="#bbf7d0" strokeWidth="1" />
        <text x="82" y="212" fontFamily="'DM Sans', sans-serif" fontSize="13" fontWeight="600" fill="#14532d">Cab to airport</text>
        <text x="82" y="230" fontFamily="'DM Sans', sans-serif" fontSize="11" fill="#64748b">Paid by Jovial</text>
        <text x="248" y="212" fontFamily="'DM Sans', sans-serif" fontSize="14" fontWeight="700" fill="#15803d" textAnchor="end">₹960</text>
        <rect x="82" y="242" width="60" height="18" rx="9" fill="#dcfce7" />
        <text x="112" y="254" fontFamily="'DM Sans', sans-serif" fontSize="9" fill="#166534" textAnchor="middle">Jovial</text>
        <rect x="148" y="242" width="38" height="18" rx="9" fill="#dcfce7" />
        <text x="167" y="254" fontFamily="'DM Sans', sans-serif" fontSize="9" fill="#166534" textAnchor="middle">Izza</text>
      </g>

      {/* ── expense card 3: Hotel ─────────────────────────── */}
      <g filter="url(#cardShadow)" style={{ animation: 'floatA 7s ease-in-out infinite 1s' }}>
        <rect x="30" y="296" width="240" height="88" rx="14" fill="url(#cardGrad3)" />
        <rect x="30" y="296" width="240" height="88" rx="14" stroke="#fef08a" strokeWidth="1" />
        <text x="52" y="326" fontFamily="'DM Sans', sans-serif" fontSize="13" fontWeight="600" fill="#713f12">Hotel — 2 nights</text>
        <text x="52" y="344" fontFamily="'DM Sans', sans-serif" fontSize="11" fill="#64748b">Paid by Izza</text>
        <text x="218" y="326" fontFamily="'DM Sans', sans-serif" fontSize="14" fontWeight="700" fill="#a16207" textAnchor="end">₹5,600</text>
        <rect x="52" y="356" width="46" height="18" rx="9" fill="#fef9c3" />
        <text x="75" y="368" fontFamily="'DM Sans', sans-serif" fontSize="9" fill="#854d0e" textAnchor="middle">All 3</text>
      </g>

      {/* ── donut chart ───────────────────────────────────── */}
      <g filter="url(#cardShadow)">
        <circle cx="580" cy="195" r="110" fill="white" />
        <circle cx="580" cy="195" r="110" stroke="#e2e8f0" strokeWidth="1" />

        {/* donut segments — total ~4360 per person */}
        {/* Izza owes most (5600/3 + 960/2 = 1866+480=2346 → but paid 5600 net = +5600-2346=+3254 creditor */}
        {/* visual proportions: Neha 38%, Jovial 32%, Izza 30% */}
        {/* cx=580 cy=195 r=78 inner r=52 */}

        {/* Neha — blue — 38% = 136.8deg starting at -90 */}
        <path
          d="M580 117 A78 78 0 0 1 647.2 234.8 L619.4 216.1 A52 52 0 0 0 580 143 Z"
          fill="#378add"
        />
        {/* Jovial — green — 32% = 115.2deg */}
        <path
          d="M647.2 234.8 A78 78 0 0 1 533.4 261.2 L546.2 239.4 A52 52 0 0 0 619.4 216.1 Z"
          fill="#1d9e75"
        />
        {/* Izza — amber — 30% = 108deg */}
        <path
          d="M533.4 261.2 A78 78 0 0 1 580 117 L580 143 A52 52 0 0 0 546.2 239.4 Z"
          fill="#ef9f27"
        />

        {/* inner white circle (donut hole) */}
        <circle cx="580" cy="195" r="52" fill="white" />

        {/* center text */}
        <text x="580" y="188" fontFamily="'DM Sans', sans-serif" fontSize="11" fill="#94a3b8" textAnchor="middle">Total</text>
        <text x="580" y="206" fontFamily="'DM Sans', sans-serif" fontSize="16" fontWeight="700" fill="#0f172a" textAnchor="middle">₹8,960</text>

        {/* legend */}
        <circle cx="500" cy="318" r="5" fill="#378add" />
        <text x="510" y="322" fontFamily="'DM Sans', sans-serif" fontSize="10" fill="#475569">Neha 38%</text>
        <circle cx="560" cy="318" r="5" fill="#1d9e75" />
        <text x="570" y="322" fontFamily="'DM Sans', sans-serif" fontSize="10" fill="#475569">Jovial 32%</text>
        <circle cx="626" cy="318" r="5" fill="#ef9f27" />
        <text x="636" y="322" fontFamily="'DM Sans', sans-serif" fontSize="10" fill="#475569">Izza 30%</text>
      </g>

      {/* ── settlement arrow ──────────────────────────────── */}
      <g opacity="0.85">
        <rect x="370" y="310" width="180" height="44" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1" filter="url(#cardShadow)" />
        <text x="384" y="328" fontFamily="'DM Sans', sans-serif" fontSize="10" fill="#94a3b8">Settlement</text>
        <text x="384" y="346" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="600" fill="#0f172a">Neha → Izza</text>
        <text x="532" y="346" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="700" fill="#185fa5" textAnchor="end">₹887</text>
      </g>

      {/* ── fade-to-white overlay at bottom ───────────────── */}
      <rect x="0" y="320" width="780" height="100" fill="url(#fadeBottom)" />

      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-7px); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
      `}</style>
    </svg>
  );
}

/* ── main page ────────────────────────────────────────────── */
export default function LandingPage() {
  const vis = useStagger(4);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f8faff 0%, #eef4ff 35%, #f0fdf8 70%, #fffbeb 100%)' }}>

      {/* subtle dot-grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      {/* ── navbar ──────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-primary">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          <span className="text-[15px] font-bold tracking-tight text-slate-800">SplitIt</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Log in
          </Link>
          <Link to="/register"
            className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors">
            Sign up
          </Link>
        </div>
      </header>

      {/* ── hero ────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-1 flex-col items-center px-6 pt-10 pb-4 sm:pt-16 text-center">

        {/* eyebrow */}
        <div
          className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white/70 px-3.5 py-1 text-xs font-medium text-blue-700 shadow-sm backdrop-blur-sm"
          style={{ opacity: vis.includes(0) ? 1 : 0, transform: vis.includes(0) ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.5s, transform 0.5s' }}>
          <Sparkles className="h-3 w-3" />
          No more awkward money talks
        </div>

        {/* headline */}
        <h1
          className="max-w-2xl text-5xl font-black tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
          style={{
            opacity: vis.includes(1) ? 1 : 0,
            transform: vis.includes(1) ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.55s, transform 0.55s',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            lineHeight: 1.05,
          }}>
          Split<span style={{ color: '#185fa5' }}>It</span>
        </h1>

        {/* subheading */}
        <p
          className="mt-4 max-w-md text-base text-slate-500 sm:text-lg"
          style={{
            opacity: vis.includes(2) ? 1 : 0,
            transform: vis.includes(2) ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.55s, transform 0.55s',
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}>
          Track shared expenses, visualise who owes what, and settle up with the fewest transactions possible.
        </p>

        {/* CTA buttons */}
        <div
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
          style={{
            opacity: vis.includes(3) ? 1 : 0,
            transform: vis.includes(3) ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.55s, transform 0.55s',
          }}>
          <Link to="/register"
            className="group flex items-center gap-2 rounded-full bg-slate-900 px-7 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-700 transition-all hover:shadow-lg hover:-translate-y-0.5">
            Sign in & save trips
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link to="/guest"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-7 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white hover:border-slate-300 transition-all hover:-translate-y-0.5">
            Try without an account
          </Link>
        </div>

        {/* illustration */}
        <div className="relative mt-14 w-full max-w-2xl">
          {/* glow beneath */}
          <div className="absolute inset-x-16 top-10 h-48 rounded-full bg-blue-100 opacity-40 blur-3xl pointer-events-none" />
          <HeroIllustration />
        </div>
      </main>

      {/* ── features strip ──────────────────────────────── */}
      <section className="relative z-10 mx-auto mt-2 mb-10 flex flex-wrap justify-center gap-x-8 gap-y-3 px-6 text-center">
        {[
          { icon: '💸', text: 'Multi-currency support' },
          { icon: '📊', text: 'Visual spend breakdown' },
          { icon: '⚡', text: 'Minimum transactions' },
          { icon: '🏷️', text: 'Custom categories' },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-sm text-slate-500">
            <span>{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </section>

      {/* ── footer ──────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-100 bg-white/40 py-4 text-center text-xs text-slate-400 backdrop-blur-sm">
        Made with <Heart className="inline-block h-3 w-3 fill-rose-400 text-rose-400 mx-0.5" /> and cookies by{' '}
        <span className="font-medium text-slate-500">ladyArtemis</span>
      </footer>
    </div>
  );
}
