import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { ApiError } from './error/api.error.js';
import { corsOptions } from './config/cors.config.js';
import userRouter from './router/user.route.js';
import supplierRoute from './router/supplier.route.js';
import warehouseRouter from './router/warehouse.route.js';
const app = express();

app.use(cors(corsOptions));
app.use(express.json({ limit: '5kb' }));
app.use(express.urlencoded({ extended: true, limit: '5kb' }));
app.use(cookieParser());
app.use(express.static(path.resolve('./public')));

app.use('/api/auth/', userRouter);
app.use('/api/suppliers', supplierRoute);
app.use('/api/warehouses', warehouseRouter);

app.use((err, req, res, next) => {
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Your session has expired. Please login again.',
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token.',
        });
    }

    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error.',
        ...(err.details && { details: err.details }),
    });
});

export { app };
