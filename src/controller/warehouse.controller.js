import { Warehouse, Zone, Location } from '../model/warehouse.model.js';
import {
    warehouseValidationSchema,
    updateWarehouseValidation,
    zoneValidationSchema,
    locationValidationSchema,
} from '../validation/warehouse.validation.js';
import { ApiError } from '../error/api.error.js';

const createWarehouseController = async (req, res) => {
    const { error, value } = warehouseValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const warehouseExists = await Warehouse.findOne({ name: value.name });
    if (warehouseExists) {
        throw new ApiError(409, 'A warehouse with this name already exists.');
    }

    const warehouse = await Warehouse.insertOne({
        name: value.name,
        address: value.address,
    });

    return res.status(201).json({
        success: true,
        message: 'Warehouse created',
        data: { warehouseId: warehouse._id },
    });
};

const getAllWarehousesController = async (req, res) => {
    const warehouses = await Warehouse.find({});

    res.status(200).json({
        success: true,
        data: warehouses,
    });
};

const getWarehouseByIDController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Warehouse ID is required');
    }

    const warehouse = await Warehouse.findById(id);

    if (!warehouse) {
        throw new ApiError(404, 'Warehouse not found');
    }

    res.status(200).json({
        success: true,
        data: warehouse,
    });
};

const updateWarehouseController = async (req, res) => {
    const { error, value } = updateWarehouseValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Warehouse ID is required');
    }

    const warehouseUpdate = await Warehouse.findByIdAndUpdate(id, value, { new: true });

    if (!warehouseUpdate) {
        throw new ApiError(404, 'Warehouse not found.');
    }

    res.status(200).json({
        success: true,
        message: 'Warehouse updated successfully.',
        data: warehouseUpdate,
    });
};

const deleteWarehouseController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Warehouse ID is required');
    }

    const warehouseDelete = await Warehouse.findByIdAndDelete(id);

    if (!warehouseDelete) {
        throw new ApiError(404, 'Warehouse not found.');
    }

    res.status(200).json({
        success: true,
        message: 'Warehouse deleted successfully.',
        data: warehouseDelete,
    });
};

const createZoneController = async (req, res) => {
    const { id: warehouseId } = req.params;

    if (!warehouseId) {
        throw new ApiError(400, 'Warehouse ID is required');
    }

    const { error, value } = zoneValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
        throw new ApiError(404, 'Warehouse not found');
    }

    const zone = await Zone.insertOne({
        warehouseId,
        name: value.name,
        temperatureZone: value.temperatureZone,
    });

    res.status(201).json({
        success: true,
        message: 'Zone created',
        data: { zoneId: zone._id },
    });
};

const getAllZonesController = async (req, res) => {
    const { id: warehouseId } = req.params;

    if (!warehouseId) {
        throw new ApiError(400, 'Warehouse ID is required');
    }

    const zones = await Zone.find({ warehouseId });

    res.status(200).json({
        success: true,
        data: zones,
    });
};

const createLocationController = async (req, res) => {
    const { error, value } = locationValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const zone = await Zone.findById(value.zoneId);
    if (!zone) {
        throw new ApiError(404, 'Zone not found');
    }

    const locationExists = await Location.findOne({ code: value.code });
    if (locationExists) {
        throw new ApiError(409, 'A location with this code already exists.');
    }

    const location = await Location.insertOne({
        zoneId: value.zoneId,
        code: value.code,
        maxVolume: value.maxVolume,
        maxWeight: value.maxWeight,
    });

    res.status(201).json({
        success: true,
        message: 'Location created',
        data: { locationId: location._id },
    });
};

const getAllLocationsController = async (req, res) => {
    const locations = await Location.find({}).populate('zoneId');

    res.status(200).json({
        success: true,
        data: locations,
    });
};

export {
    createWarehouseController,
    getAllWarehousesController,
    getWarehouseByIDController,
    updateWarehouseController,
    deleteWarehouseController,
    createZoneController,
    getAllZonesController,
    createLocationController,
    getAllLocationsController,
};
