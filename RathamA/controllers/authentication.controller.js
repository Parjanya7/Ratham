const AuthService = require('../services/authentication/AuthenticationService');


/**
 *
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const handleSignUpAction = async (req, res, next) => {
    try {
        const requestBody = req.body;
        const auth = new AuthService();
        const result =  await auth.signUp(requestBody);
        res.status(200).json({
            state: 200,
            message: 'Congratulations! You have been Registered successfully. Please login to continue.',
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
const handleLoginAction = async (req, res, next) => {
    try {
        const requestBody = req.body;
        const auth = new AuthService();
        const result =  await auth.login(requestBody);
        res.status(200).json({
            state: true,
            message: 'Authentication Successfull.',
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
 * @return {*} 
 */
const validateAuthToken = async (req, res, next) => {
    try {
        //If header is present
        if (req.headers.hasOwnProperty("authorization")) {
            const bearertoken = req.headers.authorization.split(' ');
            let token;
            //To be removed once everyone adds Bearer while sending the token.
            if(bearertoken.length > 1) {
                token = bearertoken[1];
            }
            else {
                token = bearertoken[0];
            }
            const auth = new AuthService();
            //Validate the token
            const { id, roleId, uuid } = await auth.validateAuthToken(token);

            req.uuid = uuid;
            req.roleId = roleId;
            req.id = id;

            next();
        }   
        else {
            return res.status(403).json({
                state: false,
                message: 'Authetorization Token is required in the Headers!',
                data: null
            });
        }
    } 
    catch (error) {
        next(error);
    }
};

module.exports = { handleLoginAction, validateAuthToken, handleSignUpAction };
