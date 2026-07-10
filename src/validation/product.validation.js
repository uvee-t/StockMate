import Joi from 'joi';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

const categoryValidationSchema = Joi.object({
    name: Joi.string().min(2).max(50).trim().required(),
    description: Joi.string().max(200).trim().optional(),
    parentId: Joi.string().pattern(mongoIdRegex).optional().allow(null).messages({
        'string.pattern.base': 'Invalid parent Category ID format',
    }),
})
    .strict()
    .unknown(false);

const updateCategoryValidation = Joi.object({
    name: Joi.string().min(2).max(50).trim(),
    description: Joi.string().max(200).trim(),
    parentId: Joi.string().pattern(mongoIdRegex).allow(null),
})
    .strict()
    .min(1)
    .unknown(false);

const productValidationSchema = Joi.object({
    categoryId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Category ID format',
    }),
    sku: Joi.string().min(3).max(30).trim().uppercase().required(),
    name: Joi.string().min(2).max(100).trim().required(),
    description: Joi.string().max(500).trim().optional(),
    unitPrice: Joi.number().min(0).required(),
    quantity: Joi.number().integer().min(0).default(0),
    status: Joi.string().valid('active', 'inactive').default('active'),
})
    .strict()
    .unknown(false);

const updateProductValidation = Joi.object({
    categoryId: Joi.string().pattern(mongoIdRegex),
    sku: Joi.string().min(3).max(30).trim().uppercase(),
    name: Joi.string().min(2).max(100).trim(),
    description: Joi.string().max(500).trim(),
    unitPrice: Joi.number().min(0),
    quantity: Joi.number().integer().min(0),
    status: Joi.string().valid('active', 'inactive'),
})
    .strict()
    .min(1)
    .unknown(false);

export {
    categoryValidationSchema,
    updateCategoryValidation,
    productValidationSchema,
    updateProductValidation,
};
