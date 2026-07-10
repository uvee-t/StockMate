import Joi from 'joi';

const createSavedReportValidation = Joi.object({
    name: Joi.string().min(2).max(100).trim().required(),
    reportType: Joi.string().valid('INVENTORY', 'SALES', 'PURCHASE', 'WAREHOUSE').required(),
    filters: Joi.object().optional().default({}),
})
    .strict()
    .unknown(false);

const generateReportValidation = Joi.object({
    reportType: Joi.string().valid('INVENTORY', 'SALES', 'PURCHASE', 'WAREHOUSE').required(),
    filters: Joi.object().optional().default({}),
})
    .strict()
    .unknown(false);

export { createSavedReportValidation, generateReportValidation };
