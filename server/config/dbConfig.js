module.exports = {
  development: {
    username: 'root', // mad314_user3
    password: 'admin123', // vX@0akpP5kFe
    database: 'rental', // mad314_db3
    host: '127.0.0.1', //mad310finalproject.cxzwgz0iyw0s.ca-central-1.rds.amazonaws.com
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
