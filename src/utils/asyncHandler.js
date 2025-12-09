const asyncHandler = (reqHandler) => {
    return (req, res, next) => {
        Promise.resolve(reqHandler(req, res, next)).catch((err)=> next(err));
    };//(err)=> next(err) 
    // can be used to pass the error to the next middleware
};

export {asyncHandler};

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         next(error);
//     }   
// };

// export default asyncHandler;