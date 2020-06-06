const express = require('express');
const validate = require('express-validation');
const Joi = require('joi');
const aptCtrl = require('./apartment.controller');

const router = express.Router(); // eslint-disable-line new-cap

const paramValidation = {
  manageApartment: {
    body: {
      bedrooms: Joi.number().required(),
      bathrooms: Joi.number().required(),
      squarefeet: Joi.number().required(),
      address: Joi.string().required(),
      summary: Joi.string().required(),
      type: Joi.string().required(),
      utilities: Joi.string().required(),
      parking: Joi.string().required(),
      pets: Joi.string().required(),
      furnished: Joi.string().required()
    },
    params: {
      aptId: Joi.string().hex().required(),
    },
  },
};

router.route('/getAll')
  .get(aptCtrl.list);

router.route('/')
  .post(validate(paramValidation.manageApartment), aptCtrl.create)

router.route('/:aptId')
  .get(aptCtrl.get)
  .put(validate(paramValidation.manageApartment), aptCtrl.update)
  .delete(aptCtrl.destroy);

// router.param('aptId', aptCtrl.load);

module.exports = router;
