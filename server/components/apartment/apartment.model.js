const Sequelize = require('sequelize');
const httpStatus = require('http-status');
const db = require('../../config/db');
const APIError = require('../../helpers/APIError');
const User = require('../user/user.model');

const ApartmentSchema = {
  id: {
    type: Sequelize.DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  photos: {
    type: Sequelize.DataTypes.STRING(1500),
  },
  bedrooms: {
    type: Sequelize.DataTypes.INTEGER,
    default: 1,
    allowNull: false,
  },
  bathrooms: {
    type: Sequelize.DataTypes.INTEGER,
    default: 1,
    allowNull: false,
  },
  squarefeet: {
    type: Sequelize.DataTypes.INTEGER,
    default: 0,
    allowNull: false,
  },
  address: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: Sequelize.DataTypes.GEOMETRY('POINT'),
  },
  summary: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    default: 'Studio',
  },
  utilities: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
  parking: {
    type: Sequelize.DataTypes.ENUM,
    values: ['Yes', 'No'],
  },
  pets: {
    type: Sequelize.DataTypes.ENUM,
    values: ['Yes', 'No'],
  },
  furnished: {
    type: Sequelize.DataTypes.ENUM,
    values: ['Yes', 'No'],
  },
  availableFrom: {
    type: Sequelize.DataTypes.DATE,
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

const Apartment = db.sequelize.define('apartment', ApartmentSchema);

Apartment.belongsTo(User);

Apartment.get = function get(id) {
  return this.findById(id)
    .then((apt) => {
      if (apt) {
        return apt;
      }
      const err = new APIError('No such apartment exists!', httpStatus.NOT_FOUND, true);
      return Promise.reject(err);
    });
};

Apartment.list = function list({ skip = 0, limit = 50 } = {}) {
  return this.findAll({
    limit,
    offset: skip,
    $sort: { id: 1 },
  });
};

Apartment.sync();

module.exports = Apartment;
