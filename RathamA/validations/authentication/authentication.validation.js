const { signUpSchema, loginSchema, validateUserSchema } = require('./authentication.schema');
const { errorHandler } = require('../../utils/error');


/**
 *
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const signUpValidation = async (req, res, next) => {
    try {
        const results = await signUpSchema.validate(req.body);
        if (results.error) {
            res.status(400).json({
                state: false,
                message: results.error.details[0].message
            });
        } else {
            next();
        }
    } catch (err) {
        const errorResponse = await errorHandler(err);
        next(errorResponse);
    }
};


/**
 *
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const loginValidation = async (req, res, next) => {
    try {
        const results = await loginSchema.validate(req.body);
        if (results.error) {
            res.status(400).json({
                state: false,
                message: results.error.details[0].message
            });
        } else {
            next();
        }
    } catch (err) {
        const errorResponse = await errorHandler(err);
        next(errorResponse);
    }
};

module.exports = { signUpValidation, loginValidation };