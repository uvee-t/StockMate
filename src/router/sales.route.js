import express from 'express';
import { asyncHandler } from '../util/asyncHandler.util.js';
import {
    createCustomerController,
    getAllCustomersController,
    getCustomerByIDController,
    updateCustomerController,
    deleteCustomerController,
    createSOController,
    getAllSOsController,
    getSOByIDController,
    updateSOController,
    deleteSOController,
    confirmSOController,
    cancelSOController,
    processSOController,
    completeSOController,
} from '../controller/sales.controller.js';
import { allowedUser } from '../middleware/checkUser.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Customer endpoints
router.post(
    '/customers',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(createCustomerController),
);

router.get(
    '/customers',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getAllCustomersController),
);

router.get(
    '/customers/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getCustomerByIDController),
);

router.put(
    '/customers/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(updateCustomerController),
);

router.delete(
    '/customers/:id',
    authMiddleware,
    allowedUser(['admin']),
    asyncHandler(deleteCustomerController),
);

// SalesOrder endpoints
router.post(
    '/orders',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(createSOController),
);

router.get(
    '/orders',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getAllSOsController),
);

router.get(
    '/orders/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getSOByIDController),
);

router.put(
    '/orders/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(updateSOController),
);

router.delete(
    '/orders/:id',
    authMiddleware,
    allowedUser(['admin']),
    asyncHandler(deleteSOController),
);

router.post(
    '/orders/:id/confirm',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(confirmSOController),
);

router.post(
    '/orders/:id/process',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(processSOController),
);

router.post(
    '/orders/:id/complete',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(completeSOController),
);

router.post(
    '/orders/:id/cancel',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(cancelSOController),
);

export default router;
