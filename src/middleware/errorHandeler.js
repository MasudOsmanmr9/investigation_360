export const errorHandeler = (err, req, res, next) => {
    console.error(err);
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ message: 'Unauthorized' });
    } else {
        res.status(500).json({ message: 'Internal server error' });
    }
};