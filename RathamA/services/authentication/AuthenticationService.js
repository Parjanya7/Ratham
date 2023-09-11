const jwt = require('jsonwebtoken');
const BaseService = require('../base/BaseService');
const UsersModel = require('../../models/UsersModel');
const saltRounds = 10;
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { resolvePromise } = require('../../utils/async');
const { UniqueViolationError } = require('db-errors');


/**
 *
 *
 * @class AuthService
 * @extends {BaseService}
 */
class AuthService extends BaseService {

    constructor() {
        super();
    }


    /**
     *
     *
     * @param {*} userDetails
     * @memberof AuthService
     */
    signUp = async (userDetails) => {
        try {
            const { universityId, name, password, role } = userDetails;

            //Assign Role ID based on Role provided in the request body
            let roleId;
            if (role == 'Admin') {
                roleId = 1;
            } else if (role == 'Student') {
                roleId = 2;
            } else if (role == 'Dean') {
                roleId = 3;
            } else {
                //If Role is not provided in the request body
                const errorResponse = await this.getErrorResponse(new Error('Role Id is Required!'));
                return Promise.reject(errorResponse);
            }

            //Hash the password
            let hashedPassword = await bcrypt.hash(password, saltRounds);

            //Generate the uuid for the user
            let uuid = uuidv4();

            let insertUserBody = {
                name,
                role_id: roleId,
                password: hashedPassword,
                university_id: universityId,
                uuid
            };
            //Insert the User into users table
            let theQuery = UsersModel.query().insert(insertUserBody);
            let [err, result] = await resolvePromise(theQuery);

            if (err) {
                let errorForResponse;
                if (err instanceof UniqueViolationError) {
                    //If University ID is already existing with some other user
                    errorForResponse = new Error('University ID already exists!');
                } else {
                    errorForResponse = err;
                }
                //Other not anticipated errors from the DB
                const errorResponse = await this.getErrorResponse(errorForResponse);
                return Promise.reject(errorResponse);
            }
            if (result) {
                return;
            }
        } catch (error) {
            const errorResponse = await this.getErrorResponse(error);
            return Promise.reject(errorResponse);
        }
    };


    /**
     *
     *
     * @param {*} id
     * @memberof AuthService
     */
    signToken = async (id) => {
        //Generate a Token using uuid of the user
        const token = jwt.sign({ algorithm: 'ES256', id: id }, process.env.JWT_SECRET, {
            expiresIn: parseInt(process.env.expiresIn) // expires in 24 hours
        });
        return token;
    };


    /**
     *
     *
     * @param {*} userDetails
     * @memberof AuthService
     */
    login = async (userDetails) => {
        try {
            const { universityId, password } = userDetails;

            let theQuery = UsersModel.query()
            .select('users.name as userName', 'role.role_name as role', 'password as hashedPassword', 'uuid')
            .joinRelated('role(roleSelects)')
            .modifiers({
                roleSelects: builder => {
                    builder.select('roles.name as role_name')
                }
            })
            .findOne({ university_id: universityId });
            let [err, result] = await resolvePromise(theQuery);

            if (err) {
                //Not anticipated granual level error from the DB
                const errorResponse = await this.getErrorResponse(err);
                return Promise.reject(errorResponse);
            }
            if (result) {
                const { hashedPassword, uuid, userName, role } = result;
                //Compare the stored password with the recieved password
                const passwordValidation = await bcrypt.compare(password, hashedPassword);

                if (passwordValidation) {
                    const token = await this.signToken(uuid); //Generate an Auth Token using user's uuid for an extra layer of security
                    return { uuid, userName, role, token };
                } else {
                    //If the user has provided a wrong password
                    const errorResponse = await this.getErrorResponse(new Error(`User Credential Authentication Failed!`));
                    return Promise.reject(errorResponse);                    
                }
            }
            else {
                //If the user has provided invalid University ID
                const errorResponse = await this.getErrorResponse(new Error(`User does not exist with University ID - ${universityId}!`));
                return Promise.reject(errorResponse);
            }
        } catch (err) {
            //Error handling of not anticipated errors
            const errorResponse = await this.getErrorResponse(err);
            return Promise.reject(errorResponse);
        }
    }


    /**
     *
     *
     * @param {*} token
     * @memberof AuthService
     */
    validateAuthToken = async(token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const { id } = decoded;

            //Check if user exists in DB
            let theQuery = UsersModel.query().select('id', 'role_id').findOne({ uuid: id });
            let [err, result] = await resolvePromise(theQuery);

            if (err) {
                //Handling not anticipated errors
                const errorResponse = await this.getErrorResponse(err);
                return Promise.reject(errorResponse);
            } else {
                if (!result) {
                    //If Provided Token is invalid, due to no user available with provided Token
                    const errorResponse = await this.getErrorResponse(new Error('Invalid Token Provided!'));
                    return Promise.reject(errorResponse);
                } else {
                    return { id: result.id, roleId: result.role_id, uuid: id };
                }
            }
        } catch (err) {
            //Invalid token, malformed token or id not making in DB
            const errorResponse = await this.getErrorResponse(new Error('Invalid Token Provided!'));
            return Promise.reject(errorResponse);
        }
    }
}
module.exports = AuthService
