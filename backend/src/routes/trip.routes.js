import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createTrip, getTrips, getTrip,
  updateTrip, deleteTrip, getSettlements, settleTrip,
} from '../controllers/trip.controller.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getTrips)
  .post(createTrip);

router.route('/:tripId')
  .get(getTrip)
  .put(updateTrip)
  .delete(deleteTrip);

router.get('/:tripId/settlements', getSettlements);
router.patch('/:tripId/settle',    settleTrip);

export default router;