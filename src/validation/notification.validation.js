import Joi from 'joi';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

const createTemplateValidation = Joi.object({
    name: Joi.string().min(2).max(100).trim().required(),
    subject: Joi.string().trim().optional(),
    body: Joi.string().trim().min(3).required(),
    channels: Joi.array()
        .items(Joi.string().valid('EMAIL', 'SMS', 'IN_APP'))
        .min(1)
        .required(),
})
    .strict()
    .unknown(false);

const updatePreferenceValidation = Joi.object({
    channelsEnabled: Joi.array()
        .items(Joi.string().valid('EMAIL', 'SMS', 'IN_APP'))
        .min(1)
        .required(),
})
    .strict()
    .unknown(false);

const sendNotificationValidation = Joi.object({
    recipientId: Joi.string().pattern(mongoIdRegex).required().messages({
        'string.pattern.base': 'Invalid recipient User ID format',
    }),
    title: Joi.string().min(2).max(200).trim().required(),
    message: Joi.string().min(3).required(),
    channel: Joi.string().valid('EMAIL', 'SMS', 'IN_APP').required(),
    templateId: Joi.string().pattern(mongoIdRegex).optional().allow(null),
})
    .strict()
    .unknown(false);

export { createTemplateValidation, updatePreferenceValidation, sendNotificationValidation };
