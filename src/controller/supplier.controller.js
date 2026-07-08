import { Supplier } from '../model/supplier.model.js';
import { supplierValidationSchema } from '../validation/supplier.validation.js';
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

const getAllSupplierController = async (req, res) => {};

const getSupplierByIDController = async (req, res) => {};

const updateSupplierController = async (req, res) => {};

const deleteSupplierController = async (req, res) => {};

export {
    createSupplierController,
    getAllSupplierController,
    getSupplierByIDController,
    updateSupplierController,
    deleteSupplierController,
};
