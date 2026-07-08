import { ApiError } from '../error/api.error.js';
import { registerValidationSchema, loginValidationSchema } from '../validation/user.validation.js';
import { User } from '../model/user.model.js';
import { generateHash, validateHash } from '../util/hash.util.js';

const userRegistrationController = async (req, res) => {
    const { error, value } = registerValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const emailExists = await User.findOne({ email: value.email });

    if (emailExists) {
        throw new ApiError(409, 'An account with this email already exists.');
    }

    const user = await User.insertOne({
        name: value.name,
        email: value.email,
        passwordHash: await generateHash(value.password),
        role: value.role,
    });

    return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            userId: user._id,
        },
    });
};

const userLoginController = async (req, res) => {
    const { error, value } = loginValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const user = await User.findOne({ email: value.email });

    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const isPasswordValid = await validateHash(value.password, user.passwordHash);

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid email or password');
    }

    

};

export { userRegistrationController };
