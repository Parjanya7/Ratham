const { validateAuthToken } = require('../controllers/authentication.controller');
const { createDeanSlotsAction, listAvailableSlotsForStudentsAction } = require('../controllers/slots/slots.controller');
const { createSlotsValidation } = require('../validations/slots/slots.validation');

module.exports = function(app) {
    app.post('/users/dean/create-slots', validateAuthToken, createSlotsValidation, createDeanSlotsAction);
    app.get('/users/student/dean-slots', validateAuthToken, listAvailableSlotsForStudentsAction);
};