import { Folder, File } from '../model/file.model.js';
import {
    createFolderValidation,
    createFileValidation,
    updateFileValidation,
    addVersionValidation,
} from '../validation/file.validation.js';
import { ApiError } from '../error/api.error.js';

// Folder Controllers
const createFolderController = async (req, res) => {
    const { error, value } = createFolderValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    if (value.parentId) {
        const parent = await Folder.findOne({ _id: value.parentId, userId: req.user.userId });
        if (!parent) {
            throw new ApiError(404, 'Parent folder not found.');
        }
    }

    const folder = await Folder.insertOne({
        name: value.name,
        parentId: value.parentId || null,
        userId: req.user.userId,
    });

    res.status(201).json({
        success: true,
        message: 'Folder created successfully',
        data: { folderId: folder._id },
    });
};

const getAllFoldersController = async (req, res) => {
    const folders = await Folder.find({ userId: req.user.userId });

    res.status(200).json({
        success: true,
        data: folders,
    });
};

// File Controllers
const createFileController = async (req, res) => {
    const { error, value } = createFileValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    if (value.folderId) {
        const folder = await Folder.findOne({ _id: value.folderId, userId: req.user.userId });
        if (!folder) {
            throw new ApiError(404, 'Folder not found.');
        }
    }

    const file = await File.insertOne({
        name: value.name,
        folderId: value.folderId || null,
        userId: req.user.userId,
        versions: [
            {
                versionNumber: 1,
                sizeBytes: value.sizeBytes,
                storageKey: value.storageKey,
            },
        ],
        isArchived: false,
    });

    res.status(201).json({
        success: true,
        message: 'File metadata registered',
        data: { fileId: file._id },
    });
};

const getAllFilesController = async (req, res) => {
    const { folderId, isArchived, search } = req.query;
    const filter = { userId: req.user.userId };

    if (folderId) {
        filter.folderId = folderId;
    }

    if (isArchived !== undefined) {
        filter.isArchived = isArchived === 'true';
    } else {
        filter.isArchived = false;
    }

    if (search) {
        filter.name = { $regex: search, $options: 'i' };
    }

    const files = await File.find(filter).populate('folderId');

    res.status(200).json({
        success: true,
        data: files,
    });
};

const getFileByIDController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'File ID is required');
    }

    const file = await File.findOne({ _id: id, userId: req.user.userId }).populate('folderId');
    if (!file) {
        throw new ApiError(404, 'File not found');
    }

    res.status(200).json({
        success: true,
        data: file,
    });
};

const updateFileController = async (req, res) => {
    const { error, value } = updateFileValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'File ID is required');
    }

    const file = await File.findOne({ _id: id, userId: req.user.userId });
    if (!file) {
        throw new ApiError(404, 'File not found.');
    }

    if (value.folderId) {
        const folder = await Folder.findOne({ _id: value.folderId, userId: req.user.userId });
        if (!folder) {
            throw new ApiError(404, 'Folder not found.');
        }
    }

    const fileUpdate = await File.findByIdAndUpdate(id, value, { new: true });

    res.status(200).json({
        success: true,
        message: 'File metadata updated successfully.',
        data: fileUpdate,
    });
};

const addFileVersionController = async (req, res) => {
    const { error, value } = addVersionValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'File ID is required');
    }

    const file = await File.findOne({ _id: id, userId: req.user.userId });
    if (!file) {
        throw new ApiError(404, 'File not found.');
    }

    const nextVer = file.versions.length + 1;
    file.versions.push({
        versionNumber: nextVer,
        sizeBytes: value.sizeBytes,
        storageKey: value.storageKey,
    });
    await file.save();

    res.status(200).json({
        success: true,
        message: 'File version bumped successfully.',
        data: file,
    });
};

const archiveFileController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'File ID is required');
    }

    const file = await File.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        { isArchived: true },
        { new: true },
    );

    if (!file) {
        throw new ApiError(404, 'File not found');
    }

    res.status(200).json({
        success: true,
        message: 'File archived successfully',
        data: file,
    });
};

const restoreFileController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'File ID is required');
    }

    const file = await File.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        { isArchived: false },
        { new: true },
    );

    if (!file) {
        throw new ApiError(404, 'File not found');
    }

    res.status(200).json({
        success: true,
        message: 'File restored successfully',
        data: file,
    });
};

const deleteFileController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'File ID is required');
    }

    const file = await File.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!file) {
        throw new ApiError(404, 'File not found');
    }

    res.status(200).json({
        success: true,
        message: 'File permanently deleted',
    });
};

const getFileDownloadURLController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'File ID is required');
    }

    const file = await File.findOne({ _id: id, userId: req.user.userId });
    if (!file) {
        throw new ApiError(404, 'File not found');
    }

    const latestVersion = file.versions[file.versions.length - 1];
    const mockSignedUrl = `https://mock-storage.local/download/${latestVersion.storageKey}?signature=mock_sig_val_${Date.now()}`;

    res.status(200).json({
        success: true,
        data: {
            downloadUrl: mockSignedUrl,
        },
    });
};

export {
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
};
