import mongoose from 'mongoose';

const pickTaskSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required'],
    },
    fromLocationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: [true, 'From Location ID is required'],
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
    },
    pickedQuantity: {
        type: Number,
        required: [true, 'Picked quantity is required'],
        default: 0,
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING',
    },
});

const pickListSchema = new mongoose.Schema(
    {
        salesOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SalesOrder',
            required: [true, 'Sales Order ID is required'],
        },
        code: {
            type: String,
            required: [true, 'Picklist code is required'],
            unique: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['DRAFT', 'RELEASED', 'START', 'COMPLETED', 'CANCELLED'],
            default: 'DRAFT',
        },
        tasks: [pickTaskSchema],
    },
    { timestamps: true },
);

const stockReservationSchema = new mongoose.Schema(
    {
        salesOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SalesOrder',
            required: [true, 'Sales Order ID is required'],
        },
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
            min: [1, 'Quantity must be at least 1'],
        },
    },
    { timestamps: true },
);

const cartonLineSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required'],
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
    },
});

const cartonSchema = new mongoose.Schema({
    cartonNumber: {
        type: String,
        required: [true, 'Carton number is required'],
    },
    lines: [cartonLineSchema],
});

const shipmentSchema = new mongoose.Schema(
    {
        salesOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SalesOrder',
            required: [true, 'Sales Order ID is required'],
        },
        shipmentNumber: {
            type: String,
            required: [true, 'Shipment number is required'],
            unique: true,
            trim: true,
        },
        carrier: {
            type: String,
            required: [true, 'Carrier is required'],
        },
        trackingNumber: {
            type: String,
            required: [true, 'Tracking number is required'],
        },
        cartons: [cartonSchema],
        status: {
            type: String,
            enum: ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
            default: 'PENDING',
        },
    },
    { timestamps: true },
);

const PickList = mongoose.model('PickList', pickListSchema);
const StockReservation = mongoose.model('StockReservation', stockReservationSchema);
const Shipment = mongoose.model('Shipment', shipmentSchema);

export { PickList, StockReservation, Shipment };
