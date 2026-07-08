import Joi from 'joi';
import { emailValidation } from './common.validation.js';

const supplierValidationSchema = Joi.object({
    name: Joi.string().min(2).max(50).trim().required(),
    contactPerson: Joi.string().min(2).max(50).trim().required(),
    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            'string.pattern.base': 'Phone number must be 10 digits',
        }),
    email: emailValidation.required(),
    address: Joi.string().trim().min(5).max(200).required().messages({
        'string.empty': 'Address is required',
        'string.min': 'Address must be at least 5 characters long',
        'string.max': 'Address cannot exceed 200 characters',
    }),
})
    .strict()
    .unknown(false);

const updateSupplierValidation = Joi.object({
    name: Joi.string().min(2).max(50).trim(),
    contactPerson: Joi.string().min(2).max(50).trim(),
    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .messages({
            'string.pattern.base': 'Phone number must be 10 digits',
        }),
    email: emailValidation,
    address: Joi.string().trim().min(5).max(200).messages({
        'string.empty': 'Address is required',
        'string.min': 'Address must be at least 5 characters long',
        'string.max': 'Address cannot exceed 200 characters',
    }),
})
    .strict()
    .min(1)
    .unknown(false);

export { supplierValidationSchema, updateSupplierValidation };
