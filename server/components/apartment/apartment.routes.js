const express = require('express');
const validate = require('express-validation');
const Joi = require('joi');
const aptCtrl = require('./apartment.controller');
const Multer = require('multer');
const path = require('path');
const expressJwt = require('express-jwt');
const config = require('../../config');

const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  return cb('Please provide only Images!');
};

const multer = Multer({
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

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
      furnished: Joi.string().required(),
    },
    params: {
      aptId: Joi.string().hex().required(),
    },
  },
};

router.route('/getAll')
  .get(aptCtrl.list);

router.route('/:aptId')
  .get(aptCtrl.get);

router.use(expressJwt({ secret: config.jwtSecret }));

router.route('/')
  .post(multer.array('files'), aptCtrl.create);

router.route('/:aptId')
  .put(validate(paramValidation.manageApartment), aptCtrl.update)
  .delete(aptCtrl.destroy);

// router.param('aptId', aptCtrl.load);

module.exports = {
  router,
};
