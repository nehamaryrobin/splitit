import Trip from '../models/trip.model.js';
import { computeSettlements } from '../utils/settlement.utils.js';

export async function createTrip(req, res, next) {
  try {
    const { name, currency, participants, categories, catEnabled } = req.body;
    if (!name) return res.status(400).json({ message: 'Trip name is required' });
    const trip = await Trip.create({
      name, currency, participants, categories, catEnabled,
      owner: req.user._id,
    });
    res.status(201).json(trip);
  } catch (err) { next(err); }
}

export async function getTrips(req, res, next) {
  try {
    const trips = await Trip.aggregate([
      { $match: { owner: req.user._id } },
      {
        $addFields: {
          totalSpend:    { $sum: '$expenses.amount' },
          expenseCount:  { $size: { $ifNull: ['$expenses', []] } },
        },
      },
      { $project: { expenses: 0 } }, // still exclude full expense array
      { $sort: { updatedAt: -1 } },
    ]);
    res.json(trips);
  } catch (err) { next(err); }
}

export async function getTrip(req, res, next) {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, owner: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) { next(err); }
}

export async function updateTrip(req, res, next) {
  try {
    const { name, currency, participants, categories, catEnabled, settled } = req.body;
    const updates = {};
    if (name         !== undefined) updates.name         = name;
    if (currency     !== undefined) updates.currency     = currency;
    if (participants !== undefined) updates.participants = participants;
    if (categories   !== undefined) updates.categories   = categories;
    if (catEnabled   !== undefined) updates.catEnabled   = catEnabled;
    if (settled      !== undefined) updates.settled      = settled;

    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.tripId, owner: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) { next(err); }
}

// Toggle settled on/off
export async function settleTrip(req, res, next) {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, owner: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    trip.settled = !trip.settled;
    await trip.save();
    res.json(trip);
  } catch (err) { next(err); }
}

export async function deleteTrip(req, res, next) {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.tripId, owner: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ message: 'Trip deleted' });
  } catch (err) { next(err); }
}

export async function getSettlements(req, res, next) {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, owner: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    const transactions = computeSettlements(trip.participants, trip.expenses);
    res.json({ transactions });
  } catch (err) { next(err); }
}
