const Joi = require('joi');


/** @type {*} */
const slotsSchema = {
    createSlotSchema: Joi.object({
        slots: Joi.array().items(Joi.object({
            day: Joi.string().required().valid("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"),
            time: Joi.string().required()
        })).required()
    })
}
   

module.exports = slotsSchema;
