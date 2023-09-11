const Model = require('../../config/db');
const path = require('path');

class BaseModel extends Model {
    static get modelPaths() {
        return [path.normalize(__dirname + '../../')];
    };
};

module.exports = BaseModel;