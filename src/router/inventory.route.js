import express from 'express';
import { asyncHandler } from '../util/asyncHandler.util.js';
import {
    stockInController,
    stockOutController,
    stockAdjustController,
    stockTransferController,
    queryCurrentStockController,
    getLedgerHistoryController,
    getLowStockController,
    getOutOfStockController,
} from '../controller/inventory.controller.js';
import { allowedUser } from '../middleware/checkUser.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post(
    '/in',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(stockInController),
);

router.post(
    '/out',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(stockOutController),
);

router.post(
    '/adjust',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(stockAdjustController),
);

router.post(
    '/transfer',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(stockTransferController),
);

router.get(
    '/',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(queryCurrentStockController),
);

router.get(
    '/ledger',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getLedgerHistoryController),
);

router.get(
    '/low-stock',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getLowStockController),
);

router.get(
    '/out-of-stock',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getOutOfStockController),
);

export default router;
