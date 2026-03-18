import Trip from '../models/trip.model.js';

export async function addExpense(req, res, next) {
  try {
    const { name, amount, paidBy, splitBetween, category } = req.body;
    if (!name || !amount || !paidBy || !splitBetween?.length)
      return res.status(400).json({ message: 'name, amount, paidBy and splitBetween are required' });

    const trip = await Trip.findOne({ _id: req.params.tripId, owner: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    trip.expenses.push({ name, amount, paidBy, splitBetween, category: category || 'General' });
    await trip.save();

    const added = trip.expenses[trip.expenses.length - 1];
    res.status(201).json(added);
  } catch (err) { next(err); }
}

export async function updateExpense(req, res, next) {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, owner: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const expense = trip.expenses.id(req.params.expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const { name, amount, paidBy, splitBetween, category } = req.body;
    if (name)          expense.name         = name;
    if (amount)        expense.amount       = amount;
    if (paidBy)        expense.paidBy       = paidBy;
    if (splitBetween)  expense.splitBetween = splitBetween;
    if (category)      expense.category     = category;

    await trip.save();
    res.json(expense);
  } catch (err) { next(err); }
}

export async function deleteExpense(req, res, next) {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, owner: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    trip.expenses.pull({ _id: req.params.expenseId });
    await trip.save();
    res.json({ message: 'Expense deleted' });
  } catch (err) { next(err); }
}
