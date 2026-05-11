const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.stack}`);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        error: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;
