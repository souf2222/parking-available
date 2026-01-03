import { Router, Response, Request } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  setAvailability,
  getAvailabilityByDate,
  getAvailabilityByMonth,
  deleteAvailability,
} from '../models/database';

const router: Router = Router();

router.get(
  '/:year/:month',
  async (req: Request<{ year: string; month: string }>, res: Response): Promise<void> => {
    try {
      const year = parseInt(req.params.year, 10);
      const month = parseInt(req.params.month, 10);

      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        res.status(400).json({ error: 'Invalid year or month' });
        return;
      }

      const availability = await getAvailabilityByMonth(year, month);
      res.json({ availability });
    } catch (error) {
      console.error('Error fetching monthly availability:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get(
  '/:date',
  async (req: Request<{ date: string }>, res: Response): Promise<void> => {
    try {
      const { date } = req.params;
      const availability = await getAvailabilityByDate(date);

      if (!availability) {
        res.status(404).json({ error: 'Availability not found' });
        return;
      }

      res.json({ availability });
    } catch (error) {
      console.error('Error fetching availability:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post(
  '/',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { date, status, note } = req.body;

      if (!date || !status) {
        res.status(400).json({ error: 'Date and status are required' });
        return;
      }

      const validStatuses = ['available', 'unavailable', 'partial'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be: available, unavailable, or partial' });
        return;
      }

      const availability = await setAvailability(date, status, note);
      res.status(201).json({ availability });
    } catch (error) {
      console.error('Error creating availability:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.delete(
  '/:date',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { date } = req.params;
      const deleted = await deleteAvailability(date);

      if (!deleted) {
        res.status(404).json({ error: 'Availability not found' });
        return;
      }

      res.json({ message: 'Availability deleted successfully' });
    } catch (error) {
      console.error('Error deleting availability:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
