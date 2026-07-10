import { Category, Product } from '../model/product.model.js';
import {
    categoryValidationSchema,
    updateCategoryValidation,
    productValidationSchema,
    updateProductValidation,
} from '../validation/product.validation.js';
import { ApiError } from '../error/api.error.js';

// Category Controllers
const createCategoryController = async (req, res) => {
    const { error, value } = categoryValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const categoryExists = await Category.findOne({ name: value.name });
    if (categoryExists) {
        throw new ApiError(409, 'Category with this name already exists.');
    }

    if (value.parentId) {
        const parent = await Category.findById(value.parentId);
        if (!parent) {
            throw new ApiError(404, 'Parent category not found.');
        }
    }

    const category = await Category.insertOne({
        name: value.name,
        description: value.description,
        parentId: value.parentId || null,
    });

    return res.status(201).json({
        success: true,
        message: 'Category created',
        data: { categoryId: category._id },
    });
};

const getAllCategoriesController = async (req, res) => {
    const categories = await Category.find({});

    res.status(200).json({
        success: true,
        data: categories,
    });
};

const getCategoryByIDController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Category ID is required');
    }

    const category = await Category.findById(id);

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    res.status(200).json({
        success: true,
        data: category,
    });
};

const updateCategoryController = async (req, res) => {
    const { error, value } = updateCategoryValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Category ID is required');
    }

    if (value.parentId) {
        const parent = await Category.findById(value.parentId);
        if (!parent) {
            throw new ApiError(404, 'Parent category not found.');
        }
    }

    const categoryUpdate = await Category.findByIdAndUpdate(id, value, { new: true });

    if (!categoryUpdate) {
        throw new ApiError(404, 'Category not found.');
    }

    res.status(200).json({
        success: true,
        message: 'Category updated successfully.',
        data: categoryUpdate,
    });
};

const deleteCategoryController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Category ID is required');
    }

    const categoryDelete = await Category.findByIdAndDelete(id);

    if (!categoryDelete) {
        throw new ApiError(404, 'Category not found.');
    }

    res.status(200).json({
        success: true,
        message: 'Category deleted successfully.',
        data: categoryDelete,
    });
};

// Product Controllers
const createProductController = async (req, res) => {
    const { error, value } = productValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const skuExists = await Product.findOne({ sku: value.sku });
    if (skuExists) {
        throw new ApiError(409, 'Product with this SKU already exists.');
    }

    const category = await Category.findById(value.categoryId);
    if (!category) {
        throw new ApiError(404, 'Category not found.');
    }

    const product = await Product.insertOne({
        categoryId: value.categoryId,
        sku: value.sku,
        name: value.name,
        description: value.description,
        unitPrice: value.unitPrice,
        quantity: value.quantity,
        status: value.status,
    });

    return res.status(201).json({
        success: true,
        message: 'Product created',
        data: { productId: product._id },
    });
};

const getAllProductsController = async (req, res) => {
    const { name, categoryId } = req.query;
    const filter = {};

    if (name) {
        filter.name = { $regex: name, $options: 'i' };
    }

    if (categoryId) {
        filter.categoryId = categoryId;
    }

    const products = await Product.find(filter).populate('categoryId');

    res.status(200).json({
        success: true,
        data: products,
    });
};

const getProductByIDController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Product ID is required');
    }

    const product = await Product.findById(id).populate('categoryId');

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    res.status(200).json({
        success: true,
        data: product,
    });
};

const updateProductController = async (req, res) => {
    const { error, value } = updateProductValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Product ID is required');
    }

    if (value.categoryId) {
        const category = await Category.findById(value.categoryId);
        if (!category) {
            throw new ApiError(404, 'Category not found.');
        }
    }

    const productUpdate = await Product.findByIdAndUpdate(id, value, { new: true });

    if (!productUpdate) {
        throw new ApiError(404, 'Product not found.');
    }

    res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        data: productUpdate,
    });
};

const deleteProductController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Product ID is required');
    }

    const productDelete = await Product.findByIdAndDelete(id);

    if (!productDelete) {
        throw new ApiError(404, 'Product not found.');
    }

    res.status(200).json({
        success: true,
        message: 'Product deleted successfully.',
        data: productDelete,
    });
};

export {
    createCategoryController,
    getAllCategoriesController,
    getCategoryByIDController,
    updateCategoryController,
    deleteCategoryController,
    createProductController,
    getAllProductsController,
    getProductByIDController,
    updateProductController,
    deleteProductController,
};
