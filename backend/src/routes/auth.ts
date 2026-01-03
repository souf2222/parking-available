import { Router, Response } from 'express';
import { login, AuthRequest, hashPassword } from '../middleware/auth';
import { createUser, getUserByUsername } from '../models/database';

const router: Router = Router();

router.post(
  '/login',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      const result = await login(username, password);

      if (!result) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      res.json({ token: result.token, user: result.user });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post(
  '/register',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { username, password, role } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      const existingUser = await getUserByUsername(username);
      if (existingUser) {
        res.status(409).json({ error: 'Username already exists' });
        return;
      }

      const hashedPassword = await hashPassword(password);
      const user = await createUser(username, hashedPassword, role || 'owner');
      res.status(201).json({
        user: { id: user.id, username: user.username, role: user.role },
      });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
