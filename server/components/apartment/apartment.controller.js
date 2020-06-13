const Apartment = require('./apartment.model');
const admin = require("firebase-admin");
const serviceAccount = require("../../config/key.json");
const _ = require('lodash');
const util = require('util');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.appspot.com`
});

const bucket = admin.storage().bucket();

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

const uploadImageToStorage = (files) => {
  let promises = [];
  _.forEach(files, (file) => {
    promises.push(new Promise( (resolve, reject) => {
        let newFileName = `${file.originalname}_${Date.now()}`;
        let fileUpload = bucket.file("apartments/" + newFileName);
        const blobStream = fileUpload.createWriteStream({
          metadata: {
            contentType: file.mimetype
          }
        });
        blobStream.on('error', (error) => {
          reject({message: 'Something is wrong! Unable to upload at the moment.'});
        });
        blobStream.on('finish', async function(success) {
          await fileUpload.makePublic();
          const url = util.format(`https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`);
          resolve(url);
        });
        blobStream.end(file.buffer);
      })
    );
  });
  return Promise.all(promises);
}

function create(req, res, next) {
  const apt = req.body;
  apt.userId = req.user.id;
  apt.location = {
    type: 'Point',
    coordinates: JSON.parse(apt.location),
    crs: {type: 'name', properties: {name: 'EPSG:4326'}}
  };

  if (req.files) {
    uploadImageToStorage(req.files).then((success) => {
      apt.photos = JSON.stringify(success);
      Apartment.create(apt)
        .then((apartment)=> {
          // apartment.photos = apartment.photos ? JSON.parse(apartment.photos) : null;
          return res.status(201).json(apartment);
        })
        .catch(handleError(res));
    }).catch((error) => {
      res.status(500).send(error);
    });
  }

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
