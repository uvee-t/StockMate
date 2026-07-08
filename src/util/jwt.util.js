import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS256';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

const generateToken = (payload) => {
    try {
        const token = jwt.sign(payload, JWT_SECRET, {
            algorithm: JWT_ALGORITHM,
            expiresIn: JWT_EXPIRES_IN,
        });

        return token;
    } catch (error) {
        throw error;
    }
};

const validateToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        throw error;
    }
};

export { generateToken, validateToken };
