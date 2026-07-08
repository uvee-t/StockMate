import { Supplier } from '../model/supplier.model.js';
import {
    supplierValidationSchema,
    updateSupplierValidation,
} from '../validation/supplier.validation.js';
import { ApiError } from '../error/api.error.js';

const createSupplierController = async (req, res) => {
    const { error, value } = supplierValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const supplier = await Supplier.insertOne({
        name: value.name,
        contactPerson: value.contactPerson,
        phone: value.phone,
        email: value.email,
        address: value.address,
    });

    return res.status(201).json({
        success: true,
        message: 'Supplier created',
        data: { supplierId: supplier._id },
    });
};

const getAllSupplierController = async (req, res) => {
    const suppliers = await Supplier.find({});

    if (suppliers.length === 0) {
        return res.status(200).json({
            success: true,
            data: [],
        });
    }

    res.status(200).json({
        success: true,
        data: suppliers,
    });
};

const getSupplierByIDController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'SupplierID is required');
    }

    const supplier = await Supplier.findById(id);

    if (!supplier) {
        throw new ApiError(404, 'Supplier not found');
    }

    res.status(200).json({
        success: true,
        data: supplier,
    });
};

const updateSupplierController = async (req, res) => {
    const { error, value } = updateSupplierValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'SupplierID is required');
    }

    const supplierUpdate = await Supplier.findByIdAndUpdate(id, value);

    if (!supplierUpdate) {
        throw new ApiError(404, 'Supplier not found.');
    }

    res.status(200).json({
        success: true,
        message: 'Supplier updated successfully.',
        data: {
            supplierId: supplierUpdate._id,
            ...value,
        },
    });
};

const deleteSupplierController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'SupplierID is required');
    }

    const supplierDelete = await Supplier.findByIdAndDelete(id);

    if (!supplierDelete) {
        throw new ApiError(404, 'Supplier not found.');
    }

    res.status(200).json({
        success: true,
        message: 'Supplier deleted successfully.',
        data: supplierDelete,
    });
};

export {
    createSupplierController,
    getAllSupplierController,
    getSupplierByIDController,
    updateSupplierController,
    deleteSupplierController,
};
