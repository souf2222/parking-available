import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import availabilityRouter from './routes/availability';
import authRouter from './routes/auth';
import { initDb, createTables } from './models/database';

const app: Application = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({ message: 'Parking Available API' });
});

app.use('/api/v1/availability', availabilityRouter);
app.use('/api/v1/auth', authRouter);

app.get('/error', (_req: Request, _res: Response, next: NextFunction) => {
  next(new Error('Test error'));
});

function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
}

app.use(errorHandler);

async function startServer(): Promise<void> {
  try {
    await initDb();
    await createTables();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

export default app;
