import './src/config/dotenv.config.js';
import mongoose from 'mongoose';
import { connectDB } from './src/db/db.js';
import { app } from './src/app.js';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        await connectDB();
        const server = app.listen(PORT, () => {
            console.log(`Server is UP and Running on PORT ${PORT}`);
        });
        server.on('error', (error) => {
            console.error('HTTP server error:', error);
            process.exit(1);
        });
    } catch (err) {
        console.error('Failed to connect to database:', err);
        process.exit(1);
    }
};
startServer();
