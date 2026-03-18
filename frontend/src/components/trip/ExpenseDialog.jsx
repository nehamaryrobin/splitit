import { useState, useEffect } from 'react';
import { useTrip } from '@/contexts/TripContext';
import { toast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const empty = () => ({
  name: '', amount: '', paidBy: '', category: 'General', splitBetween: [],
});

export default function ExpenseDialog({ open, onClose, expense = null }) {
  const { trip, addExpense, editExpense } = useTrip();
  const [form, setForm]   = useState(empty());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(expense
        ? { ...expense, amount: String(expense.amount) }
        : { ...empty(), splitBetween: [...(trip?.participants || [])] }
      );
    }
  }, [open, expense, trip]);

  const toggleSplit = (name) => {
    setForm((f) => ({
      ...f,
      splitBetween: f.splitBetween.includes(name)
        ? f.splitBetween.filter((n) => n !== name)
        : [...f.splitBetween, name],
    }));
  };

  const toggleAll = () => {
    setForm((f) => ({
      ...f,
      splitBetween: f.splitBetween.length === trip.participants.length
        ? [] : [...trip.participants],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast({ title: 'Name required', variant: 'destructive' });
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return toast({ title: 'Enter a valid amount', variant: 'destructive' });
    if (!form.paidBy) return toast({ title: 'Select who paid', variant: 'destructive' });
    if (!form.splitBetween.length) return toast({ title: 'Select at least one person to split', variant: 'destructive' });

    setSaving(true);
    try {
      const payload = { ...form, amount: amt };
      if (expense) await editExpense(expense._id, payload);
      else         await addExpense(payload);
      toast({ title: expense ? 'Expense updated' : 'Expense added' });
      onClose();
    } catch (e) {
      toast({ title: e?.response?.data?.message || 'Something went wrong', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const catOptions = ['General', ...(trip?.categories || [])];
  const allSelected = form.splitBetween.length === (trip?.participants?.length || 0);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          <div className="space-y-1.5">
            <Label>Expense name</Label>
            <Input placeholder="e.g. Dinner, Cab, Hotel…"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Amount ({trip?.currency})</Label>
              <Input type="number" min="0" step="0.01" placeholder="0.00"
                value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Paid by</Label>
              <Select value={form.paidBy} onValueChange={(v) => setForm({ ...form, paidBy: v })}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {(trip?.participants || []).map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {trip?.categories?.length > 0 && (
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {catOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Split between</Label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={toggleAll}
                className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  allSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-accent')}>
                All
              </button>
              {(trip?.participants || []).map((p) => {
                const on = form.splitBetween.includes(p);
                return (
                  <button key={p} type="button" onClick={() => toggleSplit(p)}
                    className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      on ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-accent')}>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : expense ? 'Update' : 'Add Expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
