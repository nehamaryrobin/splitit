import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  SplitSquareHorizontal, Plus, Search, SlidersHorizontal,
  Users, Receipt, Wallet, Trash2, Copy, ChevronDown,
  CheckCircle2, Clock, UserCircle2, ArrowUpDown, LogOut, Sun, Moon,
} from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import { AuthBackground } from './LoginPage';
import { useAuth } from '@/contexts/AuthContext';
import { useTrip } from '@/contexts/TripContext';
import { formatCurrency, CURRENCIES } from '@/lib/settlement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

// ── Profile dropdown menu ──────────────────────────────────────
function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 rounded-full border border-border bg-white/70 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-white transition-colors shadow-sm"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
          {user?.name?.[0]?.toUpperCase() || '?'}
        </span>
        <span className="hidden sm:block max-w-[120px] truncate">{user?.name}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* user info */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          {/* actions */}
          <div className="py-1">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── New trip dialog ────────────────────────────────────────────
function NewTripDialog({ open, onClose, onCreate }) {
  const [name, setName]         = useState('');
  const [currency, setCurrency] = useState('₹');
  const [saving, setSaving]     = useState(false);

  useEffect(() => { if (open) { setName(''); setCurrency('₹'); } }, [open]);

  const handleCreate = async () => {
    if (!name.trim()) return toast({ title: 'Trip name is required', variant: 'destructive' });
    setSaving(true);
    try {
      await onCreate({ name: name.trim(), currency });
      onClose();
    } catch {
      toast({ title: 'Failed to create trip', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>New Trip</DialogTitle></DialogHeader>
        <div className="space-y-4 px-6 py-2">
          <div className="space-y-1.5">
            <Label>Trip name</Label>
            <Input
              placeholder="e.g. Goa Trip, College Outing…"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => <SelectItem key={c.symbol} value={c.symbol}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? 'Creating…' : 'Create Trip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete confirmation dialog ────────────────────────────────
function DeleteDialog({ trip, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try { await onConfirm(); }
    finally { setDeleting(false); onClose(); }
  };
  return (
    <Dialog open={!!trip} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Delete Trip</DialogTitle></DialogHeader>
        <p className="px-6 py-2 text-sm text-muted-foreground">
          Are you sure you want to delete <span className="font-semibold text-foreground">"{trip?.name}"</span>?
          This cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete Trip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Trip card ─────────────────────────────────────────────────
function TripCard({ trip, onDelete, onOpen }) {
  const settled   = trip.settled || false;
  const total = trip.totalSpend || 0;
  const fmt       = (n) => formatCurrency(n, trip.currency || '₹');
  const lastDate  = trip.updatedAt
    ? new Date(trip.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
        settled ? 'border-green-200 bg-green-50/30' : 'border-border hover:border-primary/30'
      )}
      onClick={() => onOpen(trip._id)}
    >
      {/* status badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-[15px] font-bold text-foreground leading-snug line-clamp-2 flex-1"
          style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {trip.name}
        </h3>
        <span className={cn(
          'shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border',
          settled
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-blue-50 text-blue-600 border-blue-200'
        )}>
          {settled
            ? <><CheckCircle2 className="h-2.5 w-2.5" /> Settled</>
            : <><Clock className="h-2.5 w-2.5" /> Active</>
          }
        </span>
      </div>

      {/* total amount — prominent */}
      <p className="text-2xl font-black text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {trip.expenseCount > 0 ? fmt(total) : <span className="text-muted-foreground text-base font-medium">No expenses yet</span>}
      </p>

      {/* stats row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {(trip.participants || []).length} people
        </span>
        <span className="flex items-center gap-1">
          <Receipt className="h-3.5 w-3.5" />
          {trip.expenseCount || 0} expenses
        </span>
        <span className="flex items-center gap-1 ml-auto">
          {trip.currency || '₹'}
        </span>
      </div>

      <Separator className="my-3" />

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{lastDate}</span>
        {/* delete — stop propagation so card click doesn't fire */}
        <button
          onClick={e => { e.stopPropagation(); onDelete(trip); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-1.5 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────
function EmptyState({ onNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Wallet className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        No trips yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Create your first trip to start tracking shared expenses with friends.
      </p>
      <Button onClick={onNew} className="gap-2">
        <Plus className="h-4 w-4" /> Create your first trip
      </Button>
    </div>
  );
}

// ── Sort options ───────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'recent',  label: 'Most recent' },
  { value: 'name',    label: 'Name (A–Z)' },
  { value: 'amount',  label: 'Total amount' },
  { value: 'people',  label: 'Most people' },
];

// ── Main DashboardPage ─────────────────────────────────────────
export default function DashboardPage() {
  const { user, logout }                  = useAuth();
  const { trips, loading, fetchTrips, createTrip, deleteTrip } = useTrip();
  const navigate = useNavigate();
  const [dark, toggleDark] = useDarkMode();

  const [newOpen, setNewOpen]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch]         = useState('');
  const [sort, setSort]             = useState('recent');
  const [filterStatus, setFilterStatus] = useState('all'); // all | active | settled

  useEffect(() => { fetchTrips(); }, []);

  // ── Derived list ──────────────────────────────────────────────
  const displayTrips = useMemo(() => {
    let list = [...trips];

    // filter by status
    if (filterStatus === 'active')  list = list.filter(t => !t.settled);
    if (filterStatus === 'settled') list = list.filter(t =>  t.settled);

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q));
    }

    // sort
    if (sort === 'recent') list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    if (sort === 'name')   list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'amount') list.sort((a, b) => {
      const ta = (b.expenses || []).reduce((s, e) => s + e.amount, 0);
      const tb = (a.expenses || []).reduce((s, e) => s + e.amount, 0);
      return ta - tb;
    });
    if (sort === 'people') list.sort((a, b) => (b.participants || []).length - (a.participants || []).length);

    return list;
  }, [trips, search, sort, filterStatus]);

  // ── Summary stats across all trips ────────────────────────────
  const stats = useMemo(() => ({
    total:   trips.length,
    active:  trips.filter(t => !t.settled).length,
    settled: trips.filter(t =>  t.settled).length,
    spend: trips.reduce((s, t) => s + (t.totalSpend || 0), 0),
  }), [trips]);

  const handleCreate = async (data) => {
    const trip = await createTrip(data);
    toast({ title: `"${trip.name}" created!` });
    navigate(`/trips/${trip._id}`);
  };

  const handleDelete = async () => {
    await deleteTrip(deleteTarget._id);
    toast({ title: `"${deleteTarget.name}" deleted` });
    setDeleteTarget(null);
  };

  return (
    <AuthBackground>
      <div className="relative z-10 flex min-h-screen flex-col">

        {/* ── Navbar ─────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-5 py-4 sm:px-8 border-b border-border/50 bg-white/40 backdrop-blur-sm">
          <Link to="/"
            className="flex items-center gap-2 text-[15px] font-black text-slate-900 hover:opacity-80 transition-opacity"
            style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.3px' }}>
            <SplitSquareHorizontal className="h-5 w-5 text-primary" />
            Split<span className="text-primary">It</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleDark} title="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {/* profile dropdown */}
            <ProfileMenu user={user} onLogout={async () => { await logout(); navigate('/'); }} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">

          {/* ── Page heading ─────────────────────────────────── */}
          <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.5px' }}>
                Your Trips
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {stats.active} active · {stats.settled} settled
              </p>
            </div>
            <Button className="gap-2 self-start sm:self-auto" onClick={() => setNewOpen(true)}>
              <Plus className="h-4 w-4" /> New Trip
            </Button>
          </div>

          {/* ── Stats strip ──────────────────────────────────── */}
          {trips.length > 0 && (
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Total trips',    value: stats.total,   icon: Wallet },
                { label: 'Active',         value: stats.active,  icon: Clock },
                { label: 'Settled',        value: stats.settled, icon: CheckCircle2 },
                { label: 'All-time spend', value: `₹${stats.spend.toLocaleString('en-IN')}`, icon: Receipt },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-[11px] uppercase tracking-wide">{label}</span>
                  </div>
                  <p className="text-lg font-black text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── Create new trip card (prominent) ─────────────── */}
          <button
            onClick={() => setNewOpen(true)}
            className="mb-6 flex w-full items-center gap-4 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 px-6 py-4 text-left transition-all hover:border-primary/60 hover:bg-primary/10 group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 group-hover:bg-primary/25 transition-colors">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Create new trip</p>
              <p className="text-xs text-muted-foreground">Goa Trip, College Outing, Flatmates…</p>
            </div>
            <span className="ml-auto text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Get started →
            </span>
          </button>

          {/* ── Search + filter bar ───────────────────────────── */}
          {trips.length > 0 && (
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trips…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {/* status filter */}
              <div className="flex gap-1.5">
                {[
                  { v: 'all',     label: 'All' },
                  { v: 'active',  label: 'Active' },
                  { v: 'settled', label: 'Settled' },
                ].map(({ v, label }) => (
                  <button key={v} onClick={() => setFilterStatus(v)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      filterStatus === v
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-accent'
                    )}>
                    {label}
                  </button>
                ))}
              </div>
              {/* sort */}
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-9 w-[150px] text-xs gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ── Trip grid ────────────────────────────────────── */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : trips.length === 0 ? (
            <EmptyState onNew={() => setNewOpen(true)} />
          ) : displayTrips.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No trips match your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {displayTrips.map(trip => (
                <TripCard
                  key={trip._id}
                  trip={trip}
                  onOpen={id => navigate(`/trips/${id}`)}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </main>

        <footer className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
          Made with <span className="text-rose-400">♥</span> and cookies by{' '}
          <span className="font-medium text-foreground/60">ladyArtemis</span>
        </footer>
      </div>

      <NewTripDialog open={newOpen} onClose={() => setNewOpen(false)} onCreate={handleCreate} />
      <DeleteDialog trip={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </AuthBackground>
  );
}
