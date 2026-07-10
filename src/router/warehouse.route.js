import express from 'express';
import { asyncHandler } from '../util/asyncHandler.util.js';
import {
    createWarehouseController,
    getAllWarehousesController,
    getWarehouseByIDController,
    updateWarehouseController,
    deleteWarehouseController,
    createZoneController,
    getAllZonesController,
    createLocationController,
    getAllLocationsController,
} from '../controller/warehouse.controller.js';
import { allowedUser } from '../middleware/checkUser.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Warehouse operations
router.post('/', authMiddleware, allowedUser(['admin']), asyncHandler(createWarehouseController));

router.get(
    '/',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getAllWarehousesController),
);

router.get(
    '/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getWarehouseByIDController),
);

router.put(
    '/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(updateWarehouseController),
);

router.delete(
    '/:id',
    authMiddleware,
    allowedUser(['admin']),
    asyncHandler(deleteWarehouseController),
);

// Zone operations (nested under warehouse ID)
router.post(
    '/:id/zones',
    authMiddleware,
    allowedUser(['admin']),
    asyncHandler(createZoneController),
);

router.get(
    '/:id/zones',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getAllZonesController),
);

// Location bin operations
router.post(
    '/locations/create',
    authMiddleware,
    allowedUser(['admin']),
    asyncHandler(createLocationController),
);

router.get(
    '/locations/all',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getAllLocationsController),
);

export default router;
