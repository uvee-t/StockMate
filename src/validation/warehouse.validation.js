import Joi from 'joi';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

const warehouseValidationSchema = Joi.object({
    name: Joi.string().min(2).max(50).trim().required(),
    address: Joi.string().min(5).max(200).trim().required(),
})
    .strict()
    .unknown(false);

const updateWarehouseValidation = Joi.object({
    name: Joi.string().min(2).max(50).trim(),
    address: Joi.string().min(5).max(200).trim(),
})
    .strict()
    .min(1)
    .unknown(false);

const zoneValidationSchema = Joi.object({
    name: Joi.string().min(2).max(50).trim().required(),
    temperatureZone: Joi.string().valid('ambient', 'chilled', 'frozen').default('ambient'),
})
    .strict()
    .unknown(false);

const locationValidationSchema = Joi.object({
    zoneId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Zone ID format',
    }),
    code: Joi.string().min(2).max(50).trim().required(),
    maxVolume: Joi.number().positive().required(),
    maxWeight: Joi.number().positive().required(),
})
    .strict()
    .unknown(false);

export {
    warehouseValidationSchema,
    updateWarehouseValidation,
    zoneValidationSchema,
    locationValidationSchema,
};
