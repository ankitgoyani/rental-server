const Favourite = require('./favourites.model');
const Apartment = require('../apartment/apartment.model');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function load(req, res, next, id) {
  return Favourite.get(id)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

function get(req, res) {
  return Favourite.get(req.params.aptId)
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

function update(req, res) {
  const apartment = req.body;
  const aptId = req.params.aptId;

  return Favourite.update({
    apartment,
  }, {
    where: {
      id: aptId,
    },
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

function create(req, res) {
  const fav = req.body;
  fav.userId = req.user.id;

  Favourite.create(fav)
    .then(() => res.status(200).json({ message: true }))
    .catch(handleError(res));
}

function list(req, res) {
  return Favourite.findAll({
    where: {
      userId: req.user.id,
    },
    include: [{
      model: Apartment,
      as: 'apartment',
      required: false,
    }],
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

function destroy(req, res) {
  Favourite.destroy({
    where: {
      id: req.params.favId,
    },
  })
    .then(() => res.status(200).json({ message: true }))
    .catch(handleError(res));
}

module.exports = {
  load,
  get,
  create,
  update,
  list,
  destroy,
};
