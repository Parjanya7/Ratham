const SlotSessionsService = require('../../services/sessions/SlotSessionsService');

/**
 *
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const bookADeanSlotsAction = async (req, res, next) => {
    try {
        const { body, id, roleId } = req;
        const session = new SlotSessionsService();
        const result =  await session.bookADeanSlots({ ...body, id, roleId });
        res.status(200).json({
            state: 200,
            message: 'Congratulations! You have succesfully booked the Session.',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 *
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const listDeanPendiingSlotsAction = async (req, res, next) => {
    try {
        const { id, roleId } = req;
        const session = new SlotSessionsService();
        const result =  await session.listPendingSessionsForDean({ id, roleId });
        res.status(200).json({
            state: 200,
            message: 'List of your Pending Sessions.',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { bookADeanSlotsAction, listDeanPendiingSlotsAction };
