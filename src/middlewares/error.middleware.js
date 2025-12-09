import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    console.error(err); // For debugging

    // If it's an ApiError → send clean JSON
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
            data: err.data
        });
    }

    // For unexpected errors
    return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};

export default errorHandler;
