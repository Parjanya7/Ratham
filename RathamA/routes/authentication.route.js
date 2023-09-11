const { handleSignUpAction, handleLoginAction, validateAuthToken } = require('../controllers/authentication.controller');
const { signUpValidation, loginValidation } = require('../validations/authentication/authentication.validation');

module.exports = function(app) {
    app.get('/', validateAuthToken, async (req, res, next) => {
        res.status(200).json({ message: 'Valid Token'});
    });
    app.post('/users/signup', signUpValidation, handleSignUpAction);
    app.post('/users/login', loginValidation, handleLoginAction);
};