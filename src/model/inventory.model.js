import mongoose from 'mongoose';

const stockItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product ID is required'],
        },
        locationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
            required: [true, 'Location ID is required'],
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0, 'Quantity cannot be negative'],
            default: 0,
        },
        lotNumber: {
            type: String,
            trim: true,
        },
        serialNumber: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true },
);

stockItemSchema.index({ productId: 1, locationId: 1 }, { unique: true });

const inventoryLedgerSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product ID is required'],
        },
        locationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
            required: [true, 'Location ID is required'],
        },
        quantityChange: {
            type: Number,
            required: [true, 'Quantity change is required'],
        },
        actionType: {
            type: String,
            enum: ['STOCK_IN', 'STOCK_OUT', 'TRANSFER', 'ADJUST'],
            required: [true, 'Action type is required'],
        },
        reason: {
            type: String,
            trim: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
    },
    { timestamps: true },
);

const StockItem = mongoose.model('StockItem', stockItemSchema);
const InventoryLedger = mongoose.model('InventoryLedger', inventoryLedgerSchema);

export { StockItem, InventoryLedger };
