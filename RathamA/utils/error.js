//A common error handing function, which will generate an appropiate error for a particular use case

/**
 *
 *
 * @param {*} err
 * @return {*} 
 */
const errorHandler = async (err) => {
    var response = {
        status: null,
        message: null,
        type: null,
        data: null
    };

    if (err.message == 'University ID already exists!') {
        response.status = 409;
        response.message = err.message;
        response.type = 'UniversityIdUniqueViolation';
        response.data = {};
    } else if (err.message.includes('User does not exist with University ID')) {
        response.status = 404;
        response.message = err.message;
        response.type = 'UserNotFound';
        response.data = {};
    } else if (err.message == 'User Credential Authentication Failed!') {
        response.status = 401;
        response.message = err.message;
        response.type = 'UnAuthorizedUser';
        response.data = {};
    } else if (err.message == 'Invalid User!') {
        response.status = 401;
        response.message = err.message;
        response.type = 'InvalidUser';
        response.data = {};
    } else if (err.message == 'Student has already booked the Slot!') {
        response.status = 409;
        response.message = err.message;
        response.type = 'SlotBookingDuplication';
        response.data = {};
    } else {
        response.status = 500;
        response.message = err.message;
        response.type = 'UnknownError';
        response.data = {};
    }

    return response;
}

module.exports = { errorHandler };
