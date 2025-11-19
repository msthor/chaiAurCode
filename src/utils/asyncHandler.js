// const asyncHandler = (fn) => {
//     return (req, res, next) => {
//         Promise.resolve(fn(req, res, next)).catch((err)=> next(err));
//     };//(err)=> next(err) can be used to pass the error to the next middleware
// };

// module.exports = asyncHandler;.

const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }   
};

export default asyncHandler;