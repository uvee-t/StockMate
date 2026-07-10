import Joi from 'joi';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

const createFolderValidation = Joi.object({
    name: Joi.string().min(2).max(100).trim().required(),
    parentId: Joi.string().pattern(mongoIdRegex).optional().allow(null).messages({
        'string.pattern.base': 'Invalid parent Folder ID format',
    }),
})
    .strict()
    .unknown(false);

const createFileValidation = Joi.object({
    name: Joi.string().min(2).max(100).trim().required(),
    folderId: Joi.string().pattern(mongoIdRegex).optional().allow(null).messages({
        'string.pattern.base': 'Invalid Folder ID format',
    }),
    sizeBytes: Joi.number().integer().positive().required(),
    storageKey: Joi.string().trim().min(3).required(),
})
    .strict()
    .unknown(false);

const updateFileValidation = Joi.object({
    name: Joi.string().min(2).max(100).trim(),
    folderId: Joi.string().pattern(mongoIdRegex).allow(null),
})
    .strict()
    .min(1)
    .unknown(false);

const addVersionValidation = Joi.object({
    sizeBytes: Joi.number().integer().positive().required(),
    storageKey: Joi.string().trim().min(3).required(),
})
    .strict()
    .unknown(false);

export { createFolderValidation, createFileValidation, updateFileValidation, addVersionValidation };
