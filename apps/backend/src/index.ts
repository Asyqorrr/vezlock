import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import vaultRoutes from './routes/vault.routes';

// 1. Load Environment Variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// 2. Security & Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// 3. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);

// 4. Health Check Route
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'vezlock-backend',
        version: '1.0.0-express'
    });
});

// 5. Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Error]:', err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500
        }
    });
});

app.listen(port, () => {
    console.log(`🚀 Vezlock Backend running at http://localhost:${port}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Routes: /api/auth, /api/vault`);
});
