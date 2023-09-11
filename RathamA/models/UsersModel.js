const BaseModel = require("./base/BaseModel");

class UsersModel extends BaseModel {
  static get tableName() {
    return "users";
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
        role: {
            relation: BaseModel.HasOneRelation,
            modelClass: 'RolesModel',
            join: {
                from: 'users.role_id',
                to: 'roles.id'
            }
        },
        slot: {
            relation: BaseModel.HasManyRelation,
            modelClass: 'SlotsModel',
            join: {
                from: 'users.id',
                to: 'slots.dean_id'
            }
        }
    };
  }
}

module.exports = UsersModel;
