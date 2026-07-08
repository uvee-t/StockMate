import express from 'express';
import { asyncHandler } from '../util/asyncHandler.util.js';
import { userRegistrationController, userLoginController } from '../controller/user.controller.js';

const router = express.Router();

router.post('/register', asyncHandler(userRegistrationController));

router.post('/login', asyncHandler(userLoginController));

export default router;
