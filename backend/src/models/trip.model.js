import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  amount:        { type: Number, required: true, min: 0 },
  paidBy:        { type: String, required: true },
  splitBetween:  [{ type: String }],
  category:      { type: String, default: 'General' },
}, { timestamps: true });

const tripSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  owner:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: String }],
  categories:   [{ type: String }],
  currency:     { type: String, default: '₹' },
  settled:      { type: Boolean, default: false },
  expenses:     [expenseSchema],
}, { timestamps: true });

export default mongoose.model('Trip', tripSchema);