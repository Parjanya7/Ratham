const { errorHandler } = require('../../utils/error');
const days = require('../../constants/days');

/**
 *
 *
 * @class BaseService
 */
class BaseService {
    //Global Error Generation

    /**
     *
     *
     * @param {*} err
     * @memberof BaseService
     */
    getErrorResponse = async (err) => {
        var response = {
            status: 500,
            message: null,
            type: null,
            data: null
        };

        if(err.name == 'DBError'){
            response.message = err.message;
            response.type = err.name;
            response.data = {};
        }
        else {
            response = await errorHandler(err);
        }
        return response;
    }


    //Global Response Generation
    /**
     *
     *
     * @param {*} status
     * @param {*} message
     * @param {*} type
     * @param {*} data
     * @memberof BaseService
     */
    generateResponse = async (status, message, type, data) => {
        var response = {
            status: status,
            message: message,
            type: type,
            data: data
        };
        return response;
    };


    //Format time for meridien to a number
    /**
     *
     *
     * @param {*} timeString
     * @memberof BaseService
     */
    timeTo24HourNumber = async (timeString) => {
        let [time, meridiem] = timeString.split(' ');
        let hour = parseInt(time, 10);
    
        if (meridiem.toLowerCase() === 'pm' && hour !== 12) {
            hour += 12;
        } else if (meridiem.toLowerCase() === 'am' && hour === 12) {
            hour = 0;
        }

        return hour;
    }


    //Get a date from a time and a day of the week provided
    /**
     *
     *
     * @param {*} day
     * @param {*} hours
     * @memberof BaseService
     */
    getDateFromTimeAndDay = async (day, hours) => {
        const date = new Date();
        const currentDayIndex = date.getDay();
        const targetDayIndex = days.indexOf(day);

        // Calculate the difference in days
        let difference = targetDayIndex - currentDayIndex;
        if (difference < 0) {
            difference += 7; // If the day has already passed this week, get the date for next week
        }
        
        const seconds = 0;
        const milliseconds = 0;
        const minutes = 0;
        
        date.setDate(date.getDate() + difference);
        date.setHours(hours, minutes, seconds, milliseconds);
    
        return date;
    };

    //Add exact one week to provided date

    /**
     *
     *
     * @param {*} date
     * @memberof BaseService
     */
    addWeekToDate = async (date) => {
        let finalDate = new Date(new Date(date).getTime() + 7 * 24 * 60 * 60 * 1000);
        return finalDate;
    };
}

module.exports = BaseService;
