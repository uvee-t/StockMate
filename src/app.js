import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { ApiError } from './error/api.error.js';
import { corsOptions } from './config/cors.config.js';
import userRouter from './router/user.route.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json({ limit: '5kb' }));
app.use(express.urlencoded({ extended: true, limit: '5kb' }));
app.use(cookieParser());
app.use(express.static(path.resolve('./public')));

app.use('/api/auth/', userRouter);

app.use((err, req, res, next) => {
    if (err) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.details && { details: err.details }),
        });
    }
});

export { app };
