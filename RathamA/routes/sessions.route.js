const { validateAuthToken } = require('../controllers/authentication.controller');
const { bookADeanSlotsAction, listDeanPendiingSlotsAction } = require('../controllers/sessions/slotSessions.controller');
const { bookASlotValidation } = require('../validations/sessions/sessions.validation');

module.exports = function(app) {
    app.post('/users/student/book-dean-slot', validateAuthToken, bookASlotValidation, bookADeanSlotsAction);
    app.get('/users/dean/pending-sessions', validateAuthToken, listDeanPendiingSlotsAction);
};