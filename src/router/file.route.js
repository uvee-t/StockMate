import express from 'express';
import { asyncHandler } from '../util/asyncHandler.util.js';
import {
    createFolderController,
    getAllFoldersController,
    createFileController,
    getAllFilesController,
    getFileByIDController,
    updateFileController,
    addFileVersionController,
    archiveFileController,
    restoreFileController,
    deleteFileController,
    getFileDownloadURLController,
} from '../controller/file.controller.js';
import { allowedUser } from '../middleware/checkUser.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Folders
router.post(
    '/folders',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(createFolderController),
);

router.get(
    '/folders',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getAllFoldersController),
);

// Files
router.post(
    '/',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(createFileController),
);

router.get(
    '/',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getAllFilesController),
);

router.get(
    '/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getFileByIDController),
);

router.put(
    '/:id',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(updateFileController),
);

router.post(
    '/:id/versions',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(addFileVersionController),
);

router.patch(
    '/:id/archive',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(archiveFileController),
);

router.patch(
    '/:id/restore',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(restoreFileController),
);

router.delete('/:id', authMiddleware, allowedUser(['admin']), asyncHandler(deleteFileController));

router.get(
    '/:id/download',
    authMiddleware,
    allowedUser(['admin', 'manager']),
    asyncHandler(getFileDownloadURLController),
);

export default router;
