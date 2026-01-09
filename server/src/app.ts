import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic Health Check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

import dashboardRoutes from './routes/dashboardRoutes';
import macroscopyRoutes from './routes/macroscopyRoutes';
import aiRoutes from './routes/aiRoutes';

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/macroscopy', macroscopyRoutes);
app.use('/api/ai', aiRoutes);
// app.use('/api/mamaria', mamariaRoutes);

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

export default app;
