const BaseService = require('../base/BaseService');
const SlotsModel = require('../../models/SlotsModel');
const { resolvePromise } = require('../../utils/async');
const { UniqueViolationError } = require('db-errors');

class SlotsService extends BaseService {

    constructor() {
        super();
    }

    //Creating a slot for a Dean

    /**
     *
     *
     * @param {*} slotsDetails
     * @memberof SlotsService
     */
    createDeanSlots = async (slotsDetails) => {
        try {
            let { slots, id, roleId } = slotsDetails;
            let err, result;

            if (roleId !== '3') {
                const errorResponse = await this.getErrorResponse(new Error('Invalid User!'));
                return Promise.reject(errorResponse);
            } else {
                let insertSlotsParams = [];
                for (let slot of slots) {
                    let { day, time } = slot;

                    let timeInHr = await this.timeTo24HourNumber(time);
                    let startTime = await this.getDateFromTimeAndDay(day, timeInHr);
                    let endTime = await this.getDateFromTimeAndDay(day, timeInHr + 1);

                    insertSlotsParams.push({
                        dean_id: id,
                        is_booked: false,
                        day,
                        start_time: startTime,
                        end_time: endTime,
                        created_at: new Date(),
                        updated_at: new Date(),
                        created_by: id,
                        updated_by: id
                    });
                }
                let insertSlotQuery = SlotsModel.query().insert(insertSlotsParams);
                [err, result] = await resolvePromise(insertSlotQuery);

                if (err) {
                    let errorForResponse;
                    if (err instanceof UniqueViolationError) {
                        errorForResponse = new Error('Slot already exists with the Dean!');
                    } else {
                        errorForResponse = err;
                    }
                    const errorResponse = await this.getErrorResponse(errorForResponse);
                    return Promise.reject(errorResponse);
                }
                let ids = [];
                result.forEach(r => { ids.push(r.id) });

                let selectQuery = SlotsModel.query().select('day', 'start_time', 'end_time').whereIn('id', ids);
                [err, result] = await resolvePromise(selectQuery);

                return result;
            }

        } catch (error) {
            const errorResponse = await this.getErrorResponse(error);
            return Promise.reject(errorResponse);
        }
    };

    //Listing Available slots for the students

    /**
     *
     *
     * @param {*} listParams
     * @memberof SlotsService
     */
    listAvailableSlotsForStudents = async (listParams) => {
        try {
            const { roleId } = listParams;
            let err, result;

            if (roleId !== '2') {
                const errorResponse = await this.getErrorResponse(new Error('Invalid User!'));
                return Promise.reject(errorResponse);
            } else {
                const fetchSlotsQuery = SlotsModel.query().select('slots.id', 'day', 'start_time', 'end_time', 'dean.deanName', 'dean.deanUuid')
                .joinRelated('dean(deanSelects)')
                .where({ is_booked: false })
                .modifiers({
                    deanSelects: builder => builder.select('users.name as deanName', 'users.uuid as deanUuid')
                });
    
                [err, result] = await resolvePromise(fetchSlotsQuery);
    
                if (err) {
                    const errorResponse = await this.getErrorResponse(err);
                    return Promise.reject(errorResponse);
                }
                return result;
            }
        } catch (error) {
            const errorResponse = await this.getErrorResponse(error);
            return Promise.reject(errorResponse);
        }
    };
}
module.exports = SlotsService;
