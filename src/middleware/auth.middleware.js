import { validateToken } from '../util/jwt.util.js';

const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                error: {
                    message: 'Authentication required.',
                },
            });
        }

        const decoded = validateToken(token);

        req.user = decoded;

        next();
    } catch (error) {
        next(error);
    }
};

export { authMiddleware };
