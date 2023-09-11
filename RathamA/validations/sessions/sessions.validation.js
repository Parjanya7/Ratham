const { bookASlotSchema } = require('./sessions.schema');
const { errorHandler } = require('../../utils/error');


/**
 *
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const bookASlotValidation = async (req, res, next) => {
    try {
        const results = await bookASlotSchema.validate(req.body);
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

module.exports = { bookASlotValidation };