const Joi = require('joi');


/** @type {*} */
const authenticationSchema = {
    signUpSchema: Joi.object({
        universityId: Joi.number().required(),
        name: Joi.string().required(),
        password: Joi.string().required(),
        role: Joi.string().valid('Admin', 'Student', 'Dean').required()
    }),

    loginSchema:Joi.object({
        universityId: Joi.number().required(),
        password: Joi.string().required(),
    })
};
   

module.exports = authenticationSchema;
