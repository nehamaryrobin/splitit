import { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  SplitSquareHorizontal, PlusCircle, Pencil, Trash2,
  Check, X, CheckCircle2, Lock, ArrowLeft, Sun, Moon,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { AuthBackground } from './LoginPage';
import { useAuth } from '@/contexts/AuthContext';
import { useTrip } from '@/contexts/TripContext';
import { computeSettlements, formatCurrency, CURRENCIES, CHART_PALETTE } from '@/lib/settlement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { useDarkMode } from '@/hooks/useDarkMode';
import api from '@/lib/api';

// ── Reused sub-components (same as GuestPage) ──────────────────

function InlineTripName({ value, onChange, disabled }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  const ref = useRef(null);
  useEffect(() => { if (editing) ref.current?.select(); }, [editing]);
  const commit = () => { onChange(draft.trim() || value); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };
  if (disabled) {
    return <span className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'DM Sans',sans-serif" }}>{value}</span>;
  }
  if (editing) {
    return (
      <div className="flex items-center justify-center gap-2">
        <input ref={ref} value={draft} maxLength={40}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
          className="w-64 border-b-2 border-primary bg-transparent text-center text-2xl font-bold text-slate-800 outline-none"
          style={{ fontFamily: "'DM Sans',sans-serif" }} />
        <button onClick={commit} className="text-green-500 hover:text-green-600"><Check className="h-5 w-5" /></button>
        <button onClick={cancel} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
      </div>
    );
  }
  return (
    <button onClick={() => { setDraft(value); setEditing(true); }}
      className="group flex items-center justify-center gap-2 hover:opacity-75 transition-opacity">
      <span className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'DM Sans',sans-serif" }}>{value}</span>
      <Pencil className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}


function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-sm">
      {label}
      {onRemove && <button onClick={onRemove} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>}
    </span>
  );
}

const CAT_STYLES = [
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-green-50 text-green-700 border-green-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-pink-50 text-pink-700 border-pink-200',
  'bg-teal-50 text-teal-700 border-teal-200',
  'bg-orange-50 text-orange-700 border-orange-200',
];

function CatChip({ label, idx, onRemove }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold', CAT_STYLES[idx % CAT_STYLES.length])}>
      {label}
      {onRemove && <button onClick={onRemove} className="opacity-60 hover:opacity-100"><X className="h-3 w-3" /></button>}
    </span>
  );
}

function SplitToggle({ participants, selected, onChange }) {
  const all = participants.length > 0 && participants.every(p => selected.includes(p));
  const toggle = p => onChange(selected.includes(p) ? selected.filter(x => x !== p) : [...selected, p]);
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      <button type="button" onClick={() => onChange(all ? [] : [...participants])}
        className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors',
          all ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-accent')}>
        All
      </button>
      {participants.map(p => (
        <button key={p} type="button" onClick={() => toggle(p)}
          className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            selected.includes(p) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-accent')}>
          {p}
        </button>
      ))}
    </div>
  );
}

function ExpenseDialog({ open, onClose, onSave, participants, categories, catEnabled, currency, initial }) {
  const blank = { name: '', amount: '', paidBy: '', category: 'General', splitBetween: [...participants] };
  const [form, setForm] = useState(blank);
  useEffect(() => {
    if (open) setForm(initial ? { ...initial, amount: String(initial.amount) } : { ...blank, splitBetween: [...participants] });
  }, [open]);
  const handleSave = () => {
    if (!form.name.trim()) return toast({ title: 'Name required', variant: 'destructive' });
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return toast({ title: 'Enter a valid amount', variant: 'destructive' });
    if (!form.paidBy) return toast({ title: 'Select who paid', variant: 'destructive' });
    if (!form.splitBetween.length) return toast({ title: 'Select at least one person', variant: 'destructive' });
    onSave({ ...form, amount: amt, category: catEnabled ? (form.category || 'General') : 'General' });
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial ? 'Edit Expense' : 'Add Expense'}</DialogTitle></DialogHeader>
        <div className="space-y-4 px-6 py-2">
          <div className="space-y-1.5">
            <Label>Expense name</Label>
            <Input placeholder="e.g. Dinner, Cab…" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Amount ({currency})</Label>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Paid by</Label>
              <Select value={form.paidBy} onValueChange={v => setForm(f => ({ ...f, paidBy: v }))}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{participants.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {catEnabled && categories.length > 0 && (
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['General', ...categories].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Split between</Label>
            <SplitToggle participants={participants} selected={form.splitBetween} onChange={v => setForm(f => ({ ...f, splitBetween: v }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{initial ? 'Update' : 'Add Expense'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatCell({ label, value }) {
  return (
    <div className="rounded-lg bg-secondary px-2 py-2 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
    </div>
  );
}

function LegendRow({ color, name, pct, value }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
      <span className="flex-1 truncate">{name}</span>
      <span className="text-muted-foreground">{pct}%</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// ── Main TripPage ──────────────────────────────────────────────
export default function TripPage() {
  const { tripId }   = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const { trip, loading, fetchTrip, updateTripMeta, addExpense, editExpense, removeExpense, computeAndSettle, settlements } = useTrip();
  const [dark, toggleDark] = useDarkMode();

  const [dialog, setDialog]           = useState({ open: false, editing: null });
  const [settleConfirm, setSettleConfirm] = useState(false);
  const [computed, setComputed]       = useState(false);
  const [pInput, setPInput]           = useState('');
  const [catInput, setCatInput]       = useState('');

  useEffect(() => { fetchTrip(tripId); }, [tripId]);

  if (loading || !trip) {
    return (
      <AuthBackground>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AuthBackground>
    );
  }

  const settled   = trip.settled || false;
  const fmt       = n => formatCurrency(n, trip.currency || '₹');
  const totalSpend = (trip.expenses || []).reduce((s, e) => s + e.amount, 0);

  // ── Participants ──────────────────────────────────────────────
  const addParticipant = async () => {
    const name = pInput.trim();
    if (!name) return;
    if ((trip.participants || []).map(p => p.toLowerCase()).includes(name.toLowerCase()))
      return toast({ title: 'Already added', variant: 'destructive' });
    await updateTripMeta(tripId, { ...trip, participants: [...(trip.participants || []), name] });
    setPInput('');
  };

  // ── Categories ────────────────────────────────────────────────
  const addCategory = async () => {
    const name = catInput.trim();
    if (!name) return;
    if ((trip.categories || []).map(c => c.toLowerCase()).includes(name.toLowerCase()))
      return toast({ title: 'Already exists', variant: 'destructive' });
    await updateTripMeta(tripId, { ...trip, categories: [...(trip.categories || []), name] });
    setCatInput('');
  };

  // ── Expenses ──────────────────────────────────────────────────
  const saveExpense = async (data) => {
    try {
      if (dialog.editing !== null) {
        await editExpense(trip.expenses[dialog.editing]._id, data);
        toast({ title: 'Expense updated' });
      } else {
        await addExpense(data);
        toast({ title: 'Expense added' });
      }
      setComputed(false);
    } catch { toast({ title: 'Failed to save expense', variant: 'destructive' }); }
  };

  const deleteExpense = async (expId) => {
    await removeExpense(expId);
    setComputed(false);
  };

  // ── Compute ───────────────────────────────────────────────────
  const compute = async () => {
    if (!(trip.expenses || []).length)
      return toast({ title: 'Add at least one expense first', variant: 'destructive' });
    await computeAndSettle();
    setComputed(true);
  };

  // ── Settle ────────────────────────────────────────────────────
  const handleSettle = async () => {
    try {
      await api.patch(`/trips/${tripId}/settle`);
      await fetchTrip(tripId);
      setSettleConfirm(false);
      toast({ title: '🎉 Trip settled!' });
    } catch { toast({ title: 'Failed to settle trip', variant: 'destructive' }); }
  };

  // ── Chart data ────────────────────────────────────────────────
  const personData = (trip.participants || []).map((p, i) => {
    const val = (trip.expenses || []).reduce((s, e) =>
      s + (e.splitBetween.includes(p) ? e.amount / e.splitBetween.length : 0), 0);
    return { name: p, value: Math.round(val * 100) / 100, color: CHART_PALETTE[i % CHART_PALETTE.length] };
  }).filter(d => d.value > 0.005);

  const catData = (() => {
    if (!trip.catEnabled || !(trip.categories || []).length) return [];
    const map = {};
    (trip.expenses || []).forEach(e => {
      const c = e.category && e.category !== 'General' ? e.category : 'General';
      map[c] = (map[c] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value], i) =>
      ({ name, value: Math.round(value * 100) / 100, color: CHART_PALETTE[i % CHART_PALETTE.length] }));
  })();

  // ── Export ────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [['Expense', 'Amount', 'Currency', 'Paid By', 'Split Between', 'Category']];
    (trip.expenses || []).forEach(e => rows.push([`"${e.name}"`, e.amount, trip.currency, e.paidBy, `"${e.splitBetween.join(', ')}"`, e.category || 'General']));
    rows.push([], ['--- Settlements ---'], ['From', 'To', 'Amount']);
    (settlements || []).forEach(t => rows.push([t.from, t.to, t.amount]));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' }));
    a.download = `${trip.name}.csv`; a.click();
  };

  const exportWhatsApp = () => {
    const lines = [`💸 *${trip.name} — SplitIt Summary*`, '', '*Expenses*'];
    (trip.expenses || []).forEach(e => lines.push(`• ${e.name} — ${fmt(e.amount)} _(paid by ${e.paidBy})_`));
    lines.push('', `*Total: ${fmt(totalSpend)}*`, '', '*Settlements*');
    (settlements || []).length
      ? (settlements || []).forEach(t => lines.push(`• ${t.from} pays ${t.to}: *${fmt(t.amount)}*`))
      : lines.push('✅ All settled up!');
    lines.push('', '_Generated with SplitIt_');
    navigator.clipboard?.writeText(lines.join('\n'))
      .then(() => toast({ title: 'Copied! Paste into WhatsApp ✓' }))
      .catch(() => toast({ title: 'Copy failed', variant: 'destructive' }));
  };

  return (
    <AuthBackground>
      <div className="relative z-10 flex min-h-screen flex-col">

        {/* Navbar */}
        <header className="flex items-center justify-between px-5 py-4 sm:px-8 border-b border-border/50 bg-white/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Link to="/" className="flex items-center gap-2 text-[15px] font-black text-slate-900"
              style={{ fontFamily: "'DM Sans',sans-serif", letterSpacing: '-0.3px' }}>
              <SplitSquareHorizontal className="h-5 w-5 text-primary" />
              Split<span className="text-primary">It</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleDark} title="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <span className="hidden sm:block text-sm text-muted-foreground">{user?.name}</span>
          </div>
        </header>

        {/* Page header */}
        <div className="pb-6 pt-4 text-center">
          <h1 className="text-4xl font-black tracking-tight text-slate-900"
            style={{ fontFamily: "'DM Sans',system-ui,sans-serif", letterSpacing: '-1.5px' }}>
            Split<span className="text-primary">It</span>
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Track shared expenses &amp; settle up with the fewest transactions
          </p>
          <div className="mt-4">
            <InlineTripName
              value={trip.name}
              disabled={settled}
              onChange={async name => { await updateTripMeta(tripId, { ...trip, name }); }}
            />
            {!settled && <p className="mt-1 text-xs text-muted-foreground">Click the name to rename</p>}
          </div>
          <div className="mt-2 flex justify-center">
            <span className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
              settled ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-50 text-blue-600 border-blue-200'
            )}>
              {settled
                ? <><CheckCircle2 className="h-3.5 w-3.5" /> Settled</>
                : <><span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" /> Active</>
              }
            </span>
          </div>
        </div>

        {/* Two-column layout */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12 sm:px-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">

            {/* LEFT */}
            <div className="flex flex-col gap-4 min-w-0">

              {/* Participants */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Participants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(trip.participants || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(trip.participants || []).map(p => (
                        <Chip key={p} label={p}
                          onRemove={settled ? null : () => updateTripMeta(tripId, { ...trip, participants: trip.participants.filter(x => x !== p) })} />
                      ))}
                    </div>
                  )}
                  {!settled && (
                    <div className="flex gap-2">
                      <Input placeholder="Enter name…" value={pInput} className="flex-1"
                        onChange={e => setPInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addParticipant()} />
                      <Button variant="outline" onClick={addParticipant}>Add</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Category toggle */}
              {!settled && (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
                  <input type="checkbox" className="h-4 w-4 accent-primary"
                    checked={trip.catEnabled || false}
                    onChange={e => updateTripMeta(tripId, { ...trip, catEnabled: e.target.checked })} />
                  <span className="text-sm font-medium">Enable expense categories</span>
                  <span className="ml-auto text-xs text-muted-foreground">Optional</span>
                </label>
              )}

              {/* Categories */}
              {trip.catEnabled && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(trip.categories || []).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {(trip.categories || []).map((c, i) => (
                          <CatChip key={c} label={c} idx={i}
                            onRemove={settled ? null : () => updateTripMeta(tripId, { ...trip, categories: trip.categories.filter(x => x !== c) })} />
                        ))}
                      </div>
                    )}
                    {!settled && (
                      <div className="flex gap-2">
                        <Input placeholder="e.g. Food, Travel…" value={catInput} className="flex-1"
                          onChange={e => setCatInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addCategory()} />
                        <Button variant="outline" onClick={addCategory}>Add</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Expenses */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Expenses</CardTitle>
                    {!settled && (
                      <Select value={trip.currency || '₹'} onValueChange={v => updateTripMeta(tripId, { ...trip, currency: v })}>
                        <SelectTrigger className="h-7 w-[100px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map(c => <SelectItem key={c.symbol} value={c.symbol}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[calc(100vh-440px)] min-h-[64px] space-y-2 overflow-y-auto pr-1">
                    {!(trip.expenses || []).length
                      ? <p className="py-6 text-center text-sm text-muted-foreground">No expenses yet.</p>
                      : (trip.expenses || []).map((e, i) => {
                          const catIdx = (trip.categories || []).indexOf(e.category);
                          return (
                            <div key={e._id || i} className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold leading-tight">{e.name}</p>
                                  <p className="text-[15px] font-bold mt-0.5">{fmt(e.amount)}</p>
                                </div>
                                {!settled && (
                                  <div className="flex shrink-0 gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7"
                                      onClick={() => setDialog({ open: true, editing: i })}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive"
                                      onClick={() => deleteExpense(e._id)}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className="rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">Paid by {e.paidBy}</span>
                                <span className="rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                                  Split: {e.splitBetween.length === (trip.participants || []).length ? 'All' : e.splitBetween.join(', ')}
                                </span>
                                {trip.catEnabled && e.category && e.category !== 'General' && (
                                  <CatChip label={e.category} idx={Math.max(0, catIdx)} />
                                )}
                              </div>
                            </div>
                          );
                        })
                    }
                  </div>
                  {!settled && (
                    <Button variant="secondary" className="mt-3 gap-2"
                      onClick={() => {
                        if ((trip.participants || []).length < 2)
                          return toast({ title: 'Add at least 2 participants first', variant: 'destructive' });
                        setDialog({ open: true, editing: null });
                      }}>
                      <PlusCircle className="h-4 w-4" /> Add Expense
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Settlement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <StatCell label="Total"    value={(trip.expenses || []).length ? fmt(totalSpend) : '—'} />
                    <StatCell label="Expenses" value={(trip.expenses || []).length} />
                    <StatCell label="People"   value={(trip.participants || []).length} />
                  </div>
                  <Button className="w-full" onClick={compute}>Compute Settlements</Button>
                  {computed && (
                    <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                      {!(settlements || []).length
                        ? <p className="py-3 text-center text-sm text-muted-foreground">✓ All settled up!</p>
                        : <>
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              {settlements.length} transaction{settlements.length > 1 ? 's' : ''} needed
                            </p>
                            {settlements.map((t, i) => (
                              <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm">
                                <span className="font-semibold">{t.from}</span>
                                <span className="text-muted-foreground">→</span>
                                <span>{t.to}</span>
                                <span className="ml-auto font-bold">{fmt(t.amount)}</span>
                              </div>
                            ))}
                          </>
                      }
                    </div>
                  )}
                  {computed && (trip.expenses || []).length > 0 && (
                    <>
                      <Separator />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={exportCSV}>↓ CSV</Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={exportWhatsApp}>🔗 WhatsApp</Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Charts */}
              {computed && personData.length > 0 && (
                <Card className="animate-in slide-in-from-bottom-2 duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Amount owed per person</p>
                      <ResponsiveContainer width="100%" height={190}>
                        <PieChart>
                          <Pie data={personData} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                            paddingAngle={2} dataKey="value" animationBegin={0} animationDuration={600}>
                            {personData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                          </Pie>
                          <Tooltip formatter={v => fmt(v)} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-1 space-y-1.5">
                        {personData.map((d, i) => (
                          <LegendRow key={i} color={d.color} name={d.name}
                            pct={((d.value / totalSpend) * 100).toFixed(1)} value={fmt(d.value)} />
                        ))}
                      </div>
                    </div>
                    {trip.catEnabled && catData.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <p className="mb-1 text-xs font-medium text-muted-foreground">Spend by category</p>
                          <ResponsiveContainer width="100%" height={190}>
                            <PieChart>
                              <Pie data={catData} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                                paddingAngle={2} dataKey="value" animationBegin={0} animationDuration={600}>
                                {catData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                              </Pie>
                              <Tooltip formatter={v => fmt(v)} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="mt-1 space-y-1.5">
                            {catData.map((d, i) => (
                              <LegendRow key={i} color={d.color} name={d.name}
                                pct={((d.value / totalSpend) * 100).toFixed(1)} value={fmt(d.value)} />
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        {/* Settle strip */}
        {(trip.expenses || []).length > 0 && (
          <div className="border-t border-border/50 bg-white/50 backdrop-blur-sm px-4 py-4 sm:px-8">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <div>
                {settled ? (
                  <p className="flex items-center gap-2 text-sm font-semibold text-green-700">
                    <CheckCircle2 className="h-4 w-4" /> Trip is settled — click to reopen for editing
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Done splitting? Mark this trip as settled to lock it.</p>
                )}
              </div>
              <button
                onClick={() => setSettleConfirm(true)}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all',
                  settled
                    ? 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 active:scale-95'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-green-200 hover:-translate-y-0.5 active:scale-95'
                )}
              >
                {settled
                  ? <><Lock className="h-4 w-4" /> Settled — Unlock?</>
                  : <><Lock className="h-4 w-4" /> Settle Trip</>
                }
              </button>
            </div>
          </div>
        )}

        <footer className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
          Made with <span className="text-rose-400">♥</span> and cookies by{' '}
          <span className="font-medium text-foreground/60">ladyArtemis</span>
        </footer>
      </div>

      {/* Settle confirmation */}
      <Dialog open={settleConfirm} onOpenChange={v => !v && setSettleConfirm(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{settled ? 'Reopen this trip?' : 'Settle this trip?'}</DialogTitle>
          </DialogHeader>
          <p className="px-6 py-2 text-sm text-muted-foreground">
            {settled
              ? <>Reopening <span className="font-semibold text-foreground">"{trip.name}"</span> will unlock it for editing again.</>
              : <>Once settled, <span className="font-semibold text-foreground">"{trip.name}"</span> will be locked — no adding, editing, or deleting expenses.</>
            }
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettleConfirm(false)}>Cancel</Button>
            <Button
              className={cn('gap-2', settled ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white')}
              onClick={handleSettle}>
              {settled
                ? <><Lock className="h-4 w-4" /> Yes, reopen it</>
                : <><CheckCircle2 className="h-4 w-4" /> Yes, settle it</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense dialog */}
      <ExpenseDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, editing: null })}
        onSave={saveExpense}
        participants={trip.participants || []}
        categories={trip.categories || []}
        catEnabled={trip.catEnabled || false}
        currency={trip.currency || '₹'}
        initial={dialog.editing !== null ? trip.expenses?.[dialog.editing] : null}
      />
    </AuthBackground>
  );
}
