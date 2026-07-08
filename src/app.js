import express from 'express';
import { ApiError } from './error/api.error.js';
const app = express();



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
