const { Model } = require("objection");

//Database Connection
try {
    const { username, password, host, dbname } = {
        username: process.env.theUser,
        password: process.env.PASSWORD,
        host: process.env.HOST,
        dbname: process.env.DB
      };
      const knexMaster = require("knex")({
        client: "pg",
        connection: {
          host: host,
          user: username,
          password: password,
          database: dbname,
        },
        pool: { min: 0, max: 25 },
        searchPath: [
          process.env.NODE_ENV == "production"
            ? process.env.PROD_SCHEMA
            : process.env.DEV_SCHEMA,
        ],
      });
    
      const knexRead = require("knex")({
        client: "pg",
        connection: {
          host: host,
          user: username,
          password: password,
          database: dbname,
        },
        pool: { min: 0, max: 25 },
        searchPath: [
          process.env.NODE_ENV == "production"
            ? process.env.PROD_SCHEMA
            : process.env.DEV_SCHEMA,
        ],
      });
    
      const knexWrapper = require("knex")({
        client: "pg",
      });
    
      knexWrapper.client.runner = function (builder) {
        if (process.env.USE_REPLICA == "false") {
          return knexMaster.client.runner(builder);
        } else {
          if (builder._method == "select") {
            return knexRead.client.runner(builder);
          } else {
            return knexMaster.client.runner(builder);
          }
        }
      };
      console.log(
        process.env == "production"
          ? process.env.PROD_SCHEMA
          : process.env.DEV_SCHEMA
      );
      Model.knex(knexWrapper);
} catch (err) {
  console.log("This Error", err);
  throw new Error('Database could not get started.');
}

module.exports = Model;