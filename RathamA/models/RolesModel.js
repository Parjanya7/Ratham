const BaseModel = require("./base/BaseModel");

class RolesModel extends BaseModel {
  static get tableName() {
    return "roles";
  }

  static get idColumn() {
    return "id";
  }

  static modifiers = {
    // modifiers
  };

  //relations
  static get relationMappings() {
    return {};
  }
}

module.exports = RolesModel;
