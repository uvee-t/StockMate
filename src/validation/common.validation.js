import Joi from 'joi';

const emailValidation = Joi.string().email().max(100).lowercase().trim();

const passwordValidation = Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/)
    .required()
    .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base':
            'Password must contain at least one lowercase letter, one uppercase letter, and one special character',
    });

export { emailValidation, passwordValidation };
