import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            default: null,
        },
    },
    { timestamps: true },
);

const productSchema = new mongoose.Schema(
    {
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category ID is required'],
        },
        sku: {
            type: String,
            required: [true, 'SKU is required'],
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        unitPrice: {
            type: Number,
            required: [true, 'Unit price is required'],
            min: [0, 'Unit price cannot be negative'],
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            default: 0,
            min: [0, 'Quantity cannot be negative'],
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    { timestamps: true },
);

const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);

export { Category, Product };
