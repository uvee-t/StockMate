import Joi from 'joi';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

const pickTaskInputValidation = Joi.object({
    productId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Product ID format',
    }),
    fromLocationId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid from-Location ID format',
    }),
    quantity: Joi.number().integer().positive().required(),
});

const createPickListValidation = Joi.object({
    salesOrderId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Sales Order ID format',
    }),
    code: Joi.string().trim().min(3).max(50).required(),
    tasks: Joi.array().items(pickTaskInputValidation).min(1).required(),
})
    .strict()
    .unknown(false);

const createReservationValidation = Joi.object({
    salesOrderId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Sales Order ID format',
    }),
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

const packCartonLineValidation = Joi.object({
    productId: Joi.string().pattern(mongoIdRegex).required(),
    quantity: Joi.number().integer().positive().required(),
});

const packCartonItemValidation = Joi.object({
    cartonNumber: Joi.string().trim().min(2).required(),
    lines: Joi.array().items(packCartonLineValidation).min(1).required(),
});

const packCartonsValidation = Joi.object({
    salesOrderId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Sales Order ID format',
    }),
    cartons: Joi.array().items(packCartonItemValidation).min(1).required(),
})
    .strict()
    .unknown(false);

const dispatchShipmentValidation = Joi.object({
    salesOrderId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid Sales Order ID format',
    }),
    shipmentNumber: Joi.string().trim().min(3).required(),
    carrier: Joi.string().trim().min(2).required(),
    trackingNumber: Joi.string().trim().min(3).required(),
    cartons: Joi.array().items(packCartonItemValidation).min(1).required(),
})
    .strict()
    .unknown(false);

export {
    createPickListValidation,
    createReservationValidation,
    packCartonsValidation,
    dispatchShipmentValidation,
};
