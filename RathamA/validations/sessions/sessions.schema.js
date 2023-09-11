const Joi = require('joi');


/** @type {*} */
const sessionsSchema = {
    bookASlotSchema: Joi.object({
        slotId: Joi.string().required()
    }).required()
}
   

module.exports = sessionsSchema;
