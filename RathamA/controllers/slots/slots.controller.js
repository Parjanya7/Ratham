const SlotsService = require('../../services/slots/SlotsService');

const createDeanSlotsAction = async (req, res, next) => {
    try {
        const { uuid, id, roleId, body } = req;
        const slot = new SlotsService();
        const result =  await slot.createDeanSlots({ ...body, id, roleId });
        res.status(200).json({
            state: 200,
            message: 'Congratulations! The Slots have been Registered!',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const listAvailableSlotsForStudentsAction = async (req, res, next) => {
    try {
        const slot = new SlotsService();
        const result =  await slot.listAvailableSlotsForStudents({ roleId: req.roleId });
        res.status(200).json({
            state: 200,
            message: 'List of available slots for the students!',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createDeanSlotsAction, listAvailableSlotsForStudentsAction };
