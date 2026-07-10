import express from 'express';
import { asyncHandler } from '../util/asyncHandler.util.js';
import {
    createPurchaseOrderController,
    getAllPOsController,
    getPOByIDController,
    submitPOController,
    approvePOController,
    rejectPOController,
    cancelPOController,
    receiveGoodsController,
} from '../controller/purchase.controller.js';
import { allowedUser } from '../middleware/checkUser.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post(
    '/',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(createPurchaseOrderController),
);

router.get(
    '/',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getAllPOsController),
);

router.get(
    '/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getPOByIDController),
);

router.post(
    '/:id/submit',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(submitPOController),
);

router.post(
    '/:id/approve',
    authMiddleware,
    allowedUser(['admin']),
    asyncHandler(approvePOController),
);

router.post(
    '/:id/reject',
    authMiddleware,
    allowedUser(['admin']),
    asyncHandler(rejectPOController),
);

router.post(
    '/:id/cancel',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(cancelPOController),
);

router.post(
    '/:id/receive',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(receiveGoodsController),
);

export default router;
