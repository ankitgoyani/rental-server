const Sequelize = require('sequelize');
const httpStatus = require('http-status');
const db = require('../../config/db');
const APIError = require('../../helpers/APIError');
const User = require('../user/user.model');
const Apartment = require('../apartment/apartment.model');

const FavouriteSchema = {
  id: {
    type: Sequelize.DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  createdAt: {
    allowNull: false,
    type: Sequelize.DataTypes.DATE,
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DataTypes.DATE,
  },
};

const Favourite = db.sequelize.define('favourite', FavouriteSchema);

Favourite.belongsTo(User);
Favourite.belongsTo(Apartment);

Favourite.get = function get(id) {
  return this.findByPk(id)
    .then((apt) => {
      if (apt) {
        return apt;
      }
      const err = new APIError('No such record exists!', httpStatus.NOT_FOUND, true);
      return Promise.reject(err);
    });
};

Favourite.list = function list({ skip = 0, limit = 50 } = {}) {
  return this.findAll({
    limit,
    offset: skip,
    $sort: { id: 1 },
  });
};

Favourite.sync();

module.exports = Favourite;
