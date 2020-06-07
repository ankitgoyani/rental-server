module.exports = {
  development: {
    username: 'mad314_user3', //  mad314_user3
    password: 'vX@0akpP5kFe', // vX@0akpP5kFe
    database: 'mad314_db3', // mad314_db3
    host: 'mad310finalproject.cxzwgz0iyw0s.ca-central-1.rds.amazonaws.com', // mad310finalproject.cxzwgz0iyw0s.ca-central-1.rds.amazonaws.com
    port: 3306,
    dialect: 'mysql',
  },
  production: {
    username: 'root',
    password: null,
    database: 'node-express-sequelize-starter-prod',
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
  },
  test: {
    username: 'root',
    password: null,
    database: 'node-express-sequelize-starter-test',
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
  },
};
