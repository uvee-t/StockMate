import express from 'express';
import { asyncHandler } from '../util/asyncHandler.util.js';
import {
    createPickListController,
    getAllPickListsController,
    getPickListByIDController,
    releasePickListController,
    startPickingController,
    completePickingController,
    packCartonsController,
    dispatchShipmentController,
    getShipmentHistoryController,
    createReservationController,
    listReservationsController,
    deleteReservationController,
} from '../controller/fulfillment.controller.js';
import { allowedUser } from '../middleware/checkUser.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// PickLists
router.post(
    '/picklists',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(createPickListController),
);

router.get(
    '/picklists',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getAllPickListsController),
);

router.get(
    '/picklists/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getPickListByIDController),
);

router.post(
    '/picklists/:id/release',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(releasePickListController),
);

router.post(
    '/picklists/:id/start',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(startPickingController),
);

router.post(
    '/picklists/:id/complete',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(completePickingController),
);

// Packing & Shipments
router.post(
    '/packing',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(packCartonsController),
);

router.post(
    '/dispatch',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(dispatchShipmentController),
);

router.get(
    '/shipments',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getShipmentHistoryController),
);

// Reservations
router.post(
    '/reservations',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(createReservationController),
);

router.get(
    '/reservations',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(listReservationsController),
);

router.delete(
    '/reservations/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(deleteReservationController),
);

export default router;
