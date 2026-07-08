import Joi from 'joi';

import { emailValidation, passwordValidation } from './common.validation.js';

const registerValidationSchema = Joi.object({
    name: Joi.string().min(2).max(50).trim().required(),
    email: emailValidation.required(),
    password: passwordValidation,
    role: Joi.string().valid('admin', 'manager').lowercase().trim().required(),
})
    .strict()
    .unknown(false);

const loginValidationSchema = Joi.object({
    email: emailValidation.required(),
    password: passwordValidation,
})
    .strict()
    .unknown(false);

export { registerValidationSchema, loginValidationSchema };
