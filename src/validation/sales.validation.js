import Joi from 'joi';
import { emailValidation } from './common.validation.js';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

const createCustomerValidation = Joi.object({
    name: Joi.string().min(2).max(50).trim().required(),
    email: emailValidation.required(),
    phone: Joi.string().trim().optional(),
    address: Joi.string().trim().optional(),
})
    .strict()
    .unknown(false);

const updateCustomerValidation = Joi.object({
    name: Joi.string().min(2).max(50).trim(),
    email: emailValidation,
    phone: Joi.string().trim(),
    address: Joi.string().trim(),
})
    .strict()
    .min(1)
    .unknown(false);

const soLineValidation = Joi.object({
    productId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Product ID format',
    }),
    quantity: Joi.number().integer().positive().required(),
    unitPrice: Joi.number().min(0).required(),
});

const createSOValidation = Joi.object({
    customerId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Customer ID format',
    }),
    orderNumber: Joi.string().trim().min(3).max(50).required(),
    lines: Joi.array().items(soLineValidation).min(1).required(),
})
    .strict()
    .unknown(false);

const updateSOValidation = Joi.object({
    customerId: Joi.string().pattern(mongoIdRegex),
    orderNumber: Joi.string().trim().min(3).max(50),
    lines: Joi.array().items(soLineValidation).min(1),
    status: Joi.string().valid('DRAFT', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'),
})
    .strict()
    .min(1)
    .unknown(false);

export {
    createCustomerValidation,
    updateCustomerValidation,
    createSOValidation,
    updateSOValidation,
};
