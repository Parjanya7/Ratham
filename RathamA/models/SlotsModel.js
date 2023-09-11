const BaseModel = require("./base/BaseModel");

class SlotsModel extends BaseModel {
  static get tableName() {
    return "slots";
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
        dean: {
            relation: BaseModel.HasManyRelation,
            modelClass: 'UsersModel',
            join: {
                from: 'slots.dean_id',
                to: 'users.id'
            }
        }
    };
  }
}

module.exports = SlotsModel;
