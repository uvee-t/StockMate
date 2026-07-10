import mongoose from 'mongoose';

const purchaseOrderLineSchema = new mongoose.Schema({
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
    receivedQuantity: {
        type: Number,
        required: [true, 'Received quantity is required'],
        default: 0,
        min: [0, 'Received quantity cannot be negative'],
    },
});

const purchaseOrderSchema = new mongoose.Schema(
    {
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Supplier',
            required: [true, 'Supplier ID is required'],
        },
        poNumber: {
            type: String,
            required: [true, 'PO number is required'],
            unique: true,
            trim: true,
        },
        status: {
            type: String,
            enum: [
                'DRAFT',
                'SUBMITTED',
                'APPROVED',
                'REJECTED',
                'PARTIALLY_RECEIVED',
                'RECEIVED',
                'CANCELLED',
            ],
            required: [true, 'Status is required'],
            default: 'DRAFT',
        },
        lines: [purchaseOrderLineSchema],
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
    },
    { timestamps: true },
);

const goodsReceiptLineSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required'],
    },
    quantityReceived: {
        type: Number,
        required: [true, 'Received quantity is required'],
        min: [1, 'Quantity must be at least 1'],
    },
    lotNumber: {
        type: String,
        trim: true,
    },
});

const goodsReceiptSchema = new mongoose.Schema(
    {
        purchaseOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PurchaseOrder',
            required: [true, 'Purchase Order ID is required'],
        },
        receiptNumber: {
            type: String,
            required: [true, 'Receipt number is required'],
            unique: true,
            trim: true,
        },
        lines: [goodsReceiptLineSchema],
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
    },
    { timestamps: true },
);

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
const GoodsReceipt = mongoose.model('GoodsReceipt', goodsReceiptSchema);

export { PurchaseOrder, GoodsReceipt };
