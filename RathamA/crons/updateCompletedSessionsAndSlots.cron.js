const SlotSessionsService = require('../services/sessions/SlotSessionsService');
const cron = require('node-cron');

//Cron Job each hour to see if any of the slot has been freed, for any of the Deans
/**
 *
 *
 * @return {*} 
 */
const updateCompletedSessionsAndSlots = async () => {
    try {
        const session = new SlotSessionsService();
        const updateJob = cron.schedule('*/1 * * * *', async () => { //Every Minute as of now
            await session.updateCompletedSessionsAndSlots();
        });
        updateJob.start();
    } catch (error) {
        const errorResponse = await this.getErrorResponse(error);
        return Promise.reject(errorResponse);
    }
};

module.exports = { updateCompletedSessionsAndSlots };
