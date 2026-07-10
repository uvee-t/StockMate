import express from 'express';
import { asyncHandler } from '../util/asyncHandler.util.js';
import {
    createTemplateController,
    getAllTemplatesController,
    deleteTemplateController,
    getPreferenceController,
    updatePreferenceController,
    sendNotificationController,
    getNotificationHistoryController,
    markReadController,
    markAllReadController,
    deleteNotificationController,
} from '../controller/notification.controller.js';
import { allowedUser } from '../middleware/checkUser.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Templates
router.post(
    '/templates',
    authMiddleware,
    allowedUser(['admin']),
    asyncHandler(createTemplateController),
);

router.get(
    '/templates',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getAllTemplatesController),
);

router.delete(
    '/templates/:id',
    authMiddleware,
    allowedUser(['admin']),
    asyncHandler(deleteTemplateController),
);

// Preferences
router.get(
    '/preferences',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getPreferenceController),
);

router.put(
    '/preferences',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(updatePreferenceController),
);

// Sending and History Logs
router.post(
    '/send',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(sendNotificationController),
);

router.get(
    '/history',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getNotificationHistoryController),
);

router.patch(
    '/:id/read',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(markReadController),
);

router.post(
    '/read-all',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(markAllReadController),
);

router.delete(
    '/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(deleteNotificationController),
);

export default router;
