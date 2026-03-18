import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { addExpense, updateExpense, deleteExpense } from '../controllers/expense.controller.js';

const router = Router();

router.use(protect);

router.post('/:tripId/expenses',                addExpense);
router.put('/:tripId/expenses/:expenseId',      updateExpense);
router.delete('/:tripId/expenses/:expenseId',   deleteExpense);

export default router;
