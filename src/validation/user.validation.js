import Joi from 'joi';

import { emailValidation, passwordValidation } from './common.validation.js';

const registerValidationSchema = Joi.object({
    name: Joi.string().min(2).max(50).trim().required(),
    email: emailValidation,
    password: passwordValidation,
    role: Joi.string().valid('admin', 'manager').lowercase().trim().required(),
}).strict();

const loginValidationSchema = Joi.object({
    email: emailValidation,
    password: passwordValidation,
}).strict();

export { registerValidationSchema, loginValidationSchema };
