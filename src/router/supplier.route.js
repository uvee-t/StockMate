import express from 'express';
import { asyncHandler } from '../util/asyncHandler.util.js';
import {
    createSupplierController,
    getAllSupplierController,
    getSupplierByIDController,
    updateSupplierController,
    deleteSupplierController,
} from '../controller/supplier.controller.js';

import { allowedUser } from '../middleware/checkUser.middleware.js';

import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, allowedUser(['admin']), asyncHandler(createSupplierController));

router.get(
    '/',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getAllSupplierController),
);

router.get(
    '/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getSupplierByIDController),
);

router.put(
    '/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(updateSupplierController),
);

router.delete(
    '/:id',
    authMiddleware,
    allowedUser(['admin']),
    asyncHandler(deleteSupplierController),
);

export default router;
