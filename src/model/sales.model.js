import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email address is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true },
);

const salesOrderLineSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required'],
    },
    quantity: {
        type: Number,
        required: [true, 'Ordered quantity is required'],
        min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
        type: Number,
        required: [true, 'Unit price is required'],
        min: [0, 'Unit price cannot be negative'],
    },
});

const salesOrderSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Customer ID is required'],
        },
        orderNumber: {
            type: String,
            required: [true, 'Order number is required'],
            unique: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['DRAFT', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
            required: [true, 'Status is required'],
            default: 'DRAFT',
        },
        lines: [salesOrderLineSchema],
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
    },
    { timestamps: true },
);

const Customer = mongoose.model('Customer', customerSchema);
const SalesOrder = mongoose.model('SalesOrder', salesOrderSchema);

export { Customer, SalesOrder };
