const BaseService = require('../base/BaseService');
const { resolvePromise } = require('../../utils/async');
const SlotsModel = require('../../models/SlotsModel');
const SlotSessionsModel = require('../../models/SlotSessionsModel');
const { UniqueViolationError } = require('db-errors');


/**
 *
 *
 * @class SlotSessionsService
 * @extends {BaseService}
 */
class SlotSessionsService extends BaseService {

    constructor() {
        super();
    }


    /**
     *
     *
     * @param {*} slotsDetails
     * @memberof SlotSessionsService
     */
    bookADeanSlots = async (slotsDetails) => {
        try {
            let { slotId, id, roleId } = slotsDetails;
            let err, result;

            if (roleId !== '2') {
                //If User other than Role with Student tries to book a slot
                const errorResponse = await this.getErrorResponse(new Error('Invalid User!'));
                return Promise.reject(errorResponse);
            } else {
                //Fetch dean's user id from db to insert a record into slot_sessions table
                const fetchDeanIdQuery = SlotsModel.query()
                .select('dean.deanId')
                .joinRelated('dean(deanSelects)')
                .findOne('slots.id', slotId)
                .modifiers({
                    deanSelects: builder => builder.select('users.id as deanId')
                });
                [err, result] = await resolvePromise(fetchDeanIdQuery);

                if (err) {
                    //Granual Error Handling
                    const errorResponse = await this.getErrorResponse(err);
                    return Promise.reject(errorResponse);   
                }
                const insertSessionParams = {
                    slot_id: slotId,
                    student_id: id,
                    dean_id: result.deanId,
                    status: 'Pending',
                    booked_at: new Date(),
                    updated_at: new Date(),
                    updated_by: id
                };
                //Insert a record for a session
                let insertSlotQuery = SlotSessionsModel.query().insert(insertSessionParams);
                [err, result] = await resolvePromise(insertSlotQuery);

                if (err) {
                    let errorForResponse;
                    if (err instanceof UniqueViolationError) {
                        //If the Student has already booked a slot and trying to book the same slot again.
                        errorForResponse = new Error('Student has already booked the Slot!');
                    } else {
                        errorForResponse = err;
                    }
                    const errorResponse = await this.getErrorResponse(errorForResponse);
                    return Promise.reject(errorResponse);
                }
                let sessionId = result.id;

                const updateSlotParams = {
                    is_booked: true
                };
                //Update the slot record with booked flag
                let updateSlotQuery = SlotsModel.query().update(updateSlotParams).where({ id: slotId });
                [err, result] = await resolvePromise(updateSlotQuery);

                if (err) {
                    //Rolling back the transection if proccess fails at Slot updation fails for this particular session
                    let error = err;

                    let deleteSessionQuery = SlotSessionsModel.query().delete().where({ slot_id: slotId, student_id: id });
                    [err, result] = await resolvePromise(deleteSessionQuery);

                    if (result) {
                        //Sending error occured in first place, due to rollback of the transaction took place
                        const errorResponse = await this.getErrorResponse(error);
                        return Promise.reject(errorResponse);
                    } else {
                        //Error in rolling back the transaction
                        const errorResponse = await this.getErrorResponse(err);
                        return Promise.reject(errorResponse);
                    }
                }

                //On succesfull transaction of booking a slot, provide session details results
                let selectQuery = SlotSessionsModel.query().select('slot_id', 'student_id').where('id', sessionId);
                [err, result] = await resolvePromise(selectQuery);

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


    /**
     *
     *
     * @param {*} listParams
     * @memberof SlotSessionsService
     */
    listPendingSessionsForDean = async (listParams) => {
        try {
            let { id, roleId } = listParams;
            let err, result;

            if (roleId !== '3') {
                //If anyone other than Dean tries to list pending sessions.
                const errorResponse = await this.getErrorResponse(new Error('Invalid User!'));
                return Promise.reject(errorResponse);
            } else {
                let listSessionsQuery = SlotSessionsModel.query()
                .select('slot_sessions.id', 'status', 'slot.is_booked', 'slot.day', 'slot.start_time', 'slot.end_time', 'student.studentName')
                .joinRelated('[slot(slotSelects), student(studentSelects)]')
                .where({ dean_id: id, status: 'Pending' })
                .modifiers({
                    slotSelects: builder => builder.select('is_booked', 'day', 'start_time', 'end_time'),
                    studentSelects: builder => builder.select('users.name as studentName')
                });
                [err, result] = await resolvePromise(listSessionsQuery);

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

    //Update Slots and Sessions after Slot End Time has passed

    /**
     *
     *
     * @memberof SlotSessionsService
     */
    updateCompletedSessionsAndSlots = async () => {
        try {
            let err, result;

            //Collect Slots and Sessions required for updation
            const updatableSessionsSelectionQuery = SlotSessionsModel.query()
            .select('slot_sessions.id as sessionId', 'slot_sessions.status', 'slot.slotId', 'slot.start_time', 'slot.end_time', 'slot.deanId', 'slot.day')
            .joinRelated('slot(slotSelects)')
            .where('slot.start_time', '<', new Date())
            .modifiers({
                slotSelects: builder => builder.select('slots.id as slotId', 'slots.start_time', 'slots.end_time', 'slots.dean_id as deanId', 'slots.day')
            });
            [err, result] = await resolvePromise(updatableSessionsSelectionQuery);

            if (err) {
                const errorResponse = await this.getErrorResponse(err);
                return Promise.reject(errorResponse);
            }

            console.log(result);
            //Ids for sessions updates
            let updateSessionsIds = [];
            //bodies for new slots insertion for next week, same time
            let insertSlotsParams = [];

            for (let slotSession of result) {
                if (slotSession.status == 'Pending') {
                    updateSessionsIds.push(slotSession.sessionId);

                    //Same Start Time from next week
                    let newStartTime = await this.addWeekToDate(slotSession.start_time);
                    //Same End Time from next week
                    let newEndTime = await this.addWeekToDate(slotSession.end_time);
    
                    insertSlotsParams.push({
                        dean_id: slotSession.deanId,
                        is_booked: false,
                        day: slotSession.day,
                        start_time: newStartTime,
                        end_time: newEndTime,
                        created_at: new Date(),
                        updated_at: new Date()
                    });
                }
            }

            let updateSessionsParams = {
                status: 'Completed',
                updated_at: new Date(),
            };
            //Update Session to be Completed
            let updatedSessions;
            if (updateSessionsIds.length > 0) {
                const updateSessionsQuery = SlotSessionsModel.query().update(updateSessionsParams).whereIn('id', updateSessionsIds);
                [err, result] = await resolvePromise(updateSessionsQuery);
    
                if (err) {
                    const errorResponse = await this.getErrorResponse(err);
                    return Promise.reject(errorResponse);
                }
                updatedSessions = result;
            }

            let insertedSlots;
            if (insertSlotsParams.length > 0) {
                //Insert new slots for the Dean, with same timing upcoming week
                const insertNewSlotsQuery = SlotsModel.query().insert(insertSlotsParams);
                [err, result] = await resolvePromise(insertNewSlotsQuery);
    
                if (err) {
                    const errorResponse = await this.getErrorResponse(err);
                    return Promise.reject(errorResponse);
                }
                insertedSlots = result;
            }
            return { updatedSessions, insertedSlots };
        } catch (error) {
            const errorResponse = await this.getErrorResponse(error);
            return Promise.reject(errorResponse);
        }
    };
}

module.exports = SlotSessionsService;
