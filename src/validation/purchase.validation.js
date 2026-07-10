import Joi from 'joi';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

const poLineValidation = Joi.object({
    productId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Product ID format',
    }),
    quantity: Joi.number().integer().positive().required(),
    unitPrice: Joi.number().min(0).required(),
});

const createPOValidation = Joi.object({
    supplierId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Supplier ID format',
    }),
    poNumber: Joi.string().trim().min(3).max(50).required(),
    lines: Joi.array().items(poLineValidation).min(1).required(),
})
    .strict()
    .unknown(false);

const goodsReceiptLineValidation = Joi.object({
    productId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Product ID format',
    }),
    quantityReceived: Joi.number().integer().positive().required(),
    lotNumber: Joi.string().trim().optional(),
});

const receiveGoodsValidation = Joi.object({
    lines: Joi.array().items(goodsReceiptLineValidation).min(1).required(),
})
    .strict()
    .unknown(false);

export { createPOValidation, receiveGoodsValidation };
