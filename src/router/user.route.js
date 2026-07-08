import express from 'express';
import { asyncHandler } from '../util/asyncHandler.util.js';
import { userRegistrationController } from '../controller/user.controller.js';

const router = express.Router();

router.post('/register', asyncHandler(userRegistrationController));

export default router;
