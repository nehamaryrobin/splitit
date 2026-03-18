/**
 * Computes minimum transactions to settle all debts.
 * Used in guest mode (no server call needed).
 */
export function computeSettlements(participants, expenses) {
  const balance = {};
  participants.forEach((p) => (balance[p] = 0));

  for (const exp of expenses) {
    balance[exp.paidBy] = (balance[exp.paidBy] || 0) + exp.amount;
    const share = exp.amount / exp.splitBetween.length;
    for (const p of exp.splitBetween) {
      balance[p] = (balance[p] || 0) - share;
    }
  }

  const creditors = [];
  const debtors   = [];

  for (const [person, bal] of Object.entries(balance)) {
    const r = Math.round(bal * 100) / 100;
    if (r >  0.005) creditors.push({ person, amount: r });
    if (r < -0.005) debtors.push({ person, amount: Math.abs(r) });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  while (creditors.length && debtors.length) {
    const c = creditors[0], d = debtors[0];
    const amt = Math.min(c.amount, d.amount);
    transactions.push({ from: d.person, to: c.person, amount: Math.round(amt * 100) / 100 });
    c.amount -= amt;
    d.amount -= amt;
    if (c.amount < 0.005) creditors.shift();
    if (d.amount < 0.005) debtors.shift();
  }

  return transactions;
}

export function formatCurrency(amount, symbol) {
  const n = parseFloat(amount).toFixed(2);
  if (symbol === '₹')
    return '₹' + parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  if (['$', '€', '£'].includes(symbol))
    return symbol + parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: 2 });
  return symbol + ' ' + parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: 2 });
}

export const CURRENCIES = [
  { symbol: '₹', label: '₹ INR' },
  { symbol: '$', label: '$ USD' },
  { symbol: '€', label: '€ EUR' },
  { symbol: '£', label: '£ GBP' },
  { symbol: '¥', label: '¥ JPY' },
  { symbol: 'AED', label: 'AED' },
];

export const CHART_PALETTE = [
  '#378add', '#1d9e75', '#ef9f27', '#d4537e',
  '#7f77dd', '#d85a30', '#5dcaa5', '#ba7517',
];
