import mongoose from 'mongoose';
const supplierSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            minLength: 2,
            maxLength: 50,
            trim: true,
        },
        contactPerson: {
            type: String,
            required: [true, 'Contact Person is required'],
            minLength: 2,
            maxLength: 50,
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone Number is required'],
            minLength: 8,
            maxLength: 50,
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email address is required'],
            maxLength: 100,
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please fill a valid email address',
            ],
        },
        address: {
            type: String,
            required: [true, 'Name is required'],
            minLength: 5,
            maxLength: 200,
            trim: true,
        },
    },
    { timestamps: true },
);

const Supplier = mongoose.model('Supplier', supplierSchema);

export { Supplier };
