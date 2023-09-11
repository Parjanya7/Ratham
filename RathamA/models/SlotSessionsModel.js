const BaseModel = require("./base/BaseModel");

class SlotSessionsModel extends BaseModel {
  static get tableName() {
    return "slot_sessions";
  }

  static get idColumn() {
    return "id";
  }

  static modifiers = {
    // modifiers
  };

  //relations
  static get relationMappings() {
    return {
        slot: {
            relation: BaseModel.HasOneRelation,
            modelClass: 'SlotsModel',
            join: {
              from: 'slot_sessions.slot_id',
              to: 'slots.id'
            }
        },
        student: {
          relation: BaseModel.HasOneRelation,
          modelClass: 'UsersModel',
          join: {
            from: 'slot_sessions.student_id',
            to: 'users.id'
          }
        },
        dean: {
          relation: BaseModel.HasOneRelation,
          modelClass: 'UsersModel',
          join: {
            from: 'slot_sessions.dean_id',
            to: 'users.id'
          }
        }
    };
  }
}

module.exports = SlotSessionsModel;
