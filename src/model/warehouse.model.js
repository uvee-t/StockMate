import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Warehouse name is required'],
            unique: true,
            trim: true,
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
            trim: true,
        },
    },
    { timestamps: true },
);

const zoneSchema = new mongoose.Schema(
    {
        warehouseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Warehouse',
            required: [true, 'Warehouse ID is required'],
        },
        name: {
            type: String,
            required: [true, 'Zone name is required'],
            trim: true,
        },
        temperatureZone: {
            type: String,
            enum: ['ambient', 'chilled', 'frozen'],
            required: [true, 'Temperature zone is required'],
            default: 'ambient',
        },
    },
    { timestamps: true },
);

const locationSchema = new mongoose.Schema(
    {
        zoneId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Zone',
            required: [true, 'Zone ID is required'],
        },
        code: {
            type: String,
            required: [true, 'Location code is required'],
            unique: true,
            trim: true,
        },
        maxVolume: {
            type: Number,
            required: [true, 'Max volume is required'],
        },
        maxWeight: {
            type: Number,
            required: [true, 'Max weight is required'],
        },
    },
    { timestamps: true },
);

const Warehouse = mongoose.model('Warehouse', warehouseSchema);
const Zone = mongoose.model('Zone', zoneSchema);
const Location = mongoose.model('Location', locationSchema);

export { Warehouse, Zone, Location };
