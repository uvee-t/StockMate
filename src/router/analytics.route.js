import express from 'express';
import { asyncHandler } from '../util/asyncHandler.util.js';
import {
    createSavedReportController,
    getAllSavedReportsController,
    deleteSavedReportController,
    getDashboardSummaryController,
    getInventorySummaryController,
    getSalesSummaryController,
    getPurchaseSummaryController,
    getWarehouseSummaryController,
    getLowStockSummaryController,
    getTopSellingProductsController,
    generateReportMetadataController,
    getReportHistoryController,
} from '../controller/analytics.controller.js';
import { allowedUser } from '../middleware/checkUser.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Saved Reports Configuration
router.post(
    '/saved-reports',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(createSavedReportController),
);

router.get(
    '/saved-reports',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getAllSavedReportsController),
);

router.delete(
    '/saved-reports/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(deleteSavedReportController),
);

// Summary Aggregations
router.get(
    '/dashboard-summary',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getDashboardSummaryController),
);

router.get(
    '/inventory-summary',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getInventorySummaryController),
);

router.get(
    '/sales-summary',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getSalesSummaryController),
);

router.get(
    '/purchase-summary',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getPurchaseSummaryController),
);

router.get(
    '/warehouse-summary',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getWarehouseSummaryController),
);

router.get(
    '/low-stock',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getLowStockSummaryController),
);

router.get(
    '/top-selling',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getTopSellingProductsController),
);

// Report Generation and Logging History
router.post(
    '/generate',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(generateReportMetadataController),
);

router.get(
    '/history',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getReportHistoryController),
);

export default router;
