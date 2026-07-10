import Joi from 'joi';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

const stockInValidationSchema = Joi.object({
    productId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Product ID format',
    }),
    locationId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Location ID format',
    }),
    quantity: Joi.number().integer().positive().required(),
    lotNumber: Joi.string().trim().optional(),
    serialNumber: Joi.string().trim().optional(),
})
    .strict()
    .unknown(false);

const stockOutValidationSchema = Joi.object({
    productId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Product ID format',
    }),
    locationId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Location ID format',
    }),
    quantity: Joi.number().integer().positive().required(),
})
    .strict()
    .unknown(false);

const stockAdjustValidationSchema = Joi.object({
    productId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Product ID format',
    }),
    locationId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Location ID format',
    }),
    quantity: Joi.number().integer().required(),
    reason: Joi.string().trim().min(3).required(),
})
    .strict()
    .unknown(false);

const stockTransferValidationSchema = Joi.object({
    productId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Product ID format',
    }),
    fromLocationId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid source Location ID format',
    }),
    toLocationId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid destination Location ID format',
    }),
    quantity: Joi.number().integer().positive().required(),
    reason: Joi.string().trim().optional(),
})
    .strict()
    .unknown(false);

export {
    stockInValidationSchema,
    stockOutValidationSchema,
    stockAdjustValidationSchema,
    stockTransferValidationSchema,
};
