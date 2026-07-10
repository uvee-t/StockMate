import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Folder name is required'],
            trim: true,
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder',
            default: null,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
    },
    { timestamps: true },
);

const fileVersionSchema = new mongoose.Schema({
    versionNumber: {
        type: Number,
        required: [true, 'Version number is required'],
        default: 1,
    },
    sizeBytes: {
        type: Number,
        required: [true, 'File size in bytes is required'],
    },
    storageKey: {
        type: String,
        required: [true, 'Storage key is required'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const fileSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'File name is required'],
            trim: true,
        },
        folderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder',
            default: null,
        },
        versions: [fileVersionSchema],
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

const Folder = mongoose.model('Folder', folderSchema);
const File = mongoose.model('File', fileSchema);

export { Folder, File };
