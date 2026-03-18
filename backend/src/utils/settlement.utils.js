/**
 * Given an array of expenses and a participants list,
 * returns the minimum number of transactions to settle all debts.
 */
export function computeSettlements(participants, expenses) {
  const balance = {};
  participants.forEach(p => (balance[p] = 0));

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
    const c = creditors[0];
    const d = debtors[0];
    const amt = Math.min(c.amount, d.amount);
    transactions.push({
      from:   d.person,
      to:     c.person,
      amount: Math.round(amt * 100) / 100,
    });
    c.amount -= amt;
    d.amount -= amt;
    if (c.amount < 0.005) creditors.shift();
    if (d.amount < 0.005) debtors.shift();
  }

  return transactions;
}
