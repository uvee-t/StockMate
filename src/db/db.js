import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

const connectDB = async () => {
    try {
        const conn = mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGODB_DB_NAME,
            maxPoolSize: process.env.MONGODB_MAX_POOL_SIZE,
            minPoolSize: process.env.MONGODB_MIN_POOL_SIZE,
            serverSelectionTimeoutMS: process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
            socketTimeoutMS: process.env.MONGODB_SOCKET_TIMEOUT_MS,
        });
        return conn;
    } catch (err) {
        throw err;
    }
};

mongoose.connection.on('connected', () => {
    console.log(`MongoDB Connected: HOST <${mongoose.connection.host}>`);
});

mongoose.connection.on('disconnected', () => {
    console.warn(`MongoDB Disconnected.`);
});

mongoose.connection.on('reconnected', () => {
    console.log(`MongoDB Reconnected.`);
});

mongoose.connection.on('error', (err) => {
    console.error(`Error in connecting with MongoDB: ${err}`);
});

export { connectDB };
