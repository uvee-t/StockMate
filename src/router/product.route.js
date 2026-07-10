import express from 'express';
import { asyncHandler } from '../util/asyncHandler.util.js';
import {
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
} from '../controller/product.controller.js';
import { allowedUser } from '../middleware/checkUser.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Categories
router.post(
    '/categories',
    authMiddleware,
    allowedUser(['admin']),
    asyncHandler(createCategoryController),
);

router.get(
    '/categories',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getAllCategoriesController),
);

router.get(
    '/categories/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getCategoryByIDController),
);

router.put(
    '/categories/:id',
    authMiddleware,
    allowedUser(['admin']),
    asyncHandler(updateCategoryController),
);

router.delete(
    '/categories/:id',
    authMiddleware,
    allowedUser(['admin']),
    asyncHandler(deleteCategoryController),
);

// Products
router.post('/', authMiddleware, allowedUser(['admin']), asyncHandler(createProductController));

router.get(
    '/',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getAllProductsController),
);

router.get(
    '/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getProductByIDController),
);

router.put(
    '/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(updateProductController),
);

router.delete(
    '/:id',
    authMiddleware,
    allowedUser(['admin']),
    asyncHandler(deleteProductController),
);

export default router;
