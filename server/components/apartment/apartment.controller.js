const Apartment = require('./apartment.model');

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
  return Apartment.get(id)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

function get(req, res, next) {
  return Apartment.get(res.params.aptId)
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

function update(req, res, next) {
  const apartment = req.body;
  const aptId = req.params.aptId;

  return Apartment.update({
    apartment
  }, {
    where: {
      id: aptId
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

function create(req, res, next) {
  const apartment = req.body;

  return Apartment.create(apartment)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

function list(req, res, next) {
  const {limit = 50, skip = 0} = req.query;
  if (req.query) {
    return Apartment.findAll()
      .then(respondWithResult(res))
      .catch(handleError(res));
  } else {
    return Apartment.findAll()
      .then(respondWithResult(res))
      .catch(handleError(res));
  }
}

function destroy(req, res, next) {
  Apartment.destroy({
    where: {
      id: req.params.aptId
    }
  })
    .then(respondWithResult(res))
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
