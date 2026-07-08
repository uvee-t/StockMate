const allowedUser = (userType) => {
    return (req, res, next) => {
        const { role } = req.user;

        if (userType.includes(role)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'You are not allowed to access this resource.',
        });
    };
};

export { allowedUser };
