import Trip from '../models/trip.model.js';

function validateExpenseFields({ name, amount, paidBy, splitBetween }) {
  if (!name?.trim())          return 'Expense name is required';
  if (name.trim().length > 100) return 'Expense name too long';
  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) return 'Amount must be a positive number';
  if (amt > 10_000_000)       return 'Amount exceeds maximum allowed';
  if (!paidBy?.trim())        return 'Paid by is required';
  if (!Array.isArray(splitBetween) || !splitBetween.length)
                              return 'splitBetween must be a non-empty array';
  return null;
}

export async function addExpense(req, res, next) {
  try {
    const { name, amount, paidBy, splitBetween, category } = req.body;

    const err = validateExpenseFields({ name, amount, paidBy, splitBetween });
    if (err) return res.status(400).json({ message: err });

    const trip = await Trip.findOne({ _id: req.params.tripId, owner: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.settled) return res.status(403).json({ message: 'Trip is settled — unlock it first' });

    trip.expenses.push({
      name: name.trim(),
      amount: parseFloat(amount),
      paidBy: paidBy.trim(),
      splitBetween,
      category: category?.trim() || 'General',
    });
    await trip.save();

    const added = trip.expenses[trip.expenses.length - 1];
    res.status(201).json(added);
  } catch (err) { next(err); }
}

export async function updateExpense(req, res, next) {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, owner: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.settled) return res.status(403).json({ message: 'Trip is settled — unlock it first' });

    const expense = trip.expenses.id(req.params.expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const { name, amount, paidBy, splitBetween, category } = req.body;
    if (name)         expense.name         = name.trim();
    if (amount)       expense.amount       = parseFloat(amount);
    if (paidBy)       expense.paidBy       = paidBy.trim();
    if (splitBetween) expense.splitBetween = splitBetween;
    if (category)     expense.category     = category.trim();

    await trip.save();
    res.json(expense);
  } catch (err) { next(err); }
}

export async function deleteExpense(req, res, next) {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, owner: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.settled) return res.status(403).json({ message: 'Trip is settled — unlock it first' });

    trip.expenses.pull({ _id: req.params.expenseId });
    await trip.save();
    res.json({ message: 'Expense deleted' });
  } catch (err) { next(err); }
}
