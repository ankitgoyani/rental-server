const express = require('express');
const favCtrl = require('./favourites.controller');
const expressJwt = require('express-jwt');
const config = require('../../config');


const router = express.Router(); // eslint-disable-line new-cap

// router.route('/:aptId')
//   .get(favCtrl.get);

router.use(expressJwt({ secret: config.jwtSecret }));

router.route('/getAll')
  .get(favCtrl.list);

router.route('/add')
  .post(favCtrl.create);

router.route('/remove/:favId')
  // .put(aptCtrl.update)
  .delete(favCtrl.destroy);

// router.param('aptId', aptCtrl.load);

module.exports = {
  router,
};
