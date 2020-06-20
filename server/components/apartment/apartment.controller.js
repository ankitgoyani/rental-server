const Apartment = require('./apartment.model');
const Favourite = require('../favourites/favourites.model');
const admin = require("firebase-admin");
const serviceAccount = require("../../config/key.json");
const _ = require('lodash');
const util = require('util');
const {Op} = require("sequelize");

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
  const user = res.locals.session;
  return Apartment.get(req.params.aptId)
    .then(async (apartment) => {
      if (user) {
        let fav = await Favourite.findOne({
          where: {
            userId: user.id,
            apartmentId: apartment.id
          }
        });
        if (fav) {
          let response = apartment.toJSON();
          response.favId = fav.id;
          return response;
        }
        return apartment;
      } else {
        return apartment;
      }
    })
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
    promises.push(new Promise((resolve, reject) => {
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
        blobStream.on('finish', async function (success) {
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
        .then((apartment) => {
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
  const user = res.locals.session;
  const rooms = parseInt(req.query.rooms);
  const bathrooms = parseInt(req.query.bathrooms);
  const type = parseInt(req.query.type);
  const min = parseInt(req.query.min);
  const max = parseInt(req.query.max);
  const pets = req.query.pets === 'true';
  const filtered = req.query.filtered === 'true';
  const furnished = req.query.furnished === 'true';
  const parking = req.query.parking === 'true';
  const hydro = req.query.hydro === 'true';
  const heating = req.query.heating === 'true';
  const water = req.query.water === 'true';
  const searchString = req.query.searchString;
  if (Object.keys(req.query).length) {
    let query = {};
    if (searchString) {
      query.address = {
        [Op.like]: '%' + searchString + '%'
      }
    }
    if (rooms && rooms >= 1) {
      query.bedrooms = {
        [Op.eq]: rooms
      };
      if (rooms === 3) {
        query.bedrooms = {
          [Op.gte]: rooms
        };
      }
    }
    if (bathrooms && bathrooms >= 1) {
      query.bathrooms = {
        [Op.eq]: bathrooms
      };
      if (bathrooms === 3) {
        query.bathrooms = {
          [Op.gte]: bathrooms
        };
      }
    }
    if (type && type >= 1) {
      switch (type) {
        case 1:
          query.type = 'Studio';
          break;
        case 2:
          query.type = 'Condo';
          break;
        case 3:
          query.type = 'Duplex';
          break;
        case 4:
          query.type = 'Penthouse';
          break;
      }
    }
    if (min) {
      query.price = {
        [Op.gte]: min
      };
    }
    if (max < 5000) {
      query.price = {
        [Op.lte]: max
      };
    }
    if (filtered) {
      if (pets) {
        query.pets = 'Yes';
      } else {
        query.pets = 'No';
      }
      if (furnished) {
        query.furnished = 'Yes';
      } else {
        query.furnished = 'No';
      }
      if (parking) {
        query.parking = 'Yes';
      } else {
        query.parking = 'No';
      }
      if (hydro && heating && water) {
        query = {
          ...query,
          [Op.and]: [
            {
              utilities: {
                [Op.like]: '%Hydro%'
              }
            },
            {
              utilities: {
                [Op.like]: '%Heating%'
              }
            },
            {
              utilities: {
                [Op.like]: '%Water%'
              }
            }
          ]
        }
      } else if (!hydro && heating && water) {
        query = {
          ...query,
          [Op.and]: [
            {
              utilities: {
                [Op.like]: '%Water%'
              }
            },
            {
              utilities: {
                [Op.like]: '%Heating%'
              }
            }
          ]
        }
      } else if (!hydro && !heating && water) {
        query.utilities = {
          [Op.and]: {
            [Op.like]: '%Water%'
          }
        }
      } else if (hydro && heating && !water) {
        query = {
          ...query,
          [Op.and]: [{
            utilities: {
              [Op.like]: '%Hydro%'
            }
          },
            {
              utilities: {
                [Op.like]: '%Heating%'
              }
            }]
        };
      } else if (!hydro && heating && !water) {
        query.utilities = {
          [Op.and]: {
            [Op.like]: '%Heating%'
          }
        };
      } else if (hydro && !heating && !water) {
        query.utilities = {
          [Op.and]: {
            [Op.like]: '%Hydro%'
          }
        };
      } else if (hydro && !heating && water) {
        query = {
          ...query,
          [Op.and]: [{
            utilities: {
              [Op.like]: '%Hydro%'
            }
          },
            {
              utilities: {
                [Op.like]: '%Water%'
              }
            }]
        };
      }
    }

    return Apartment.findAll({
      where: query
    })
      .then((apartments) => {
        if (user) {
          let promises = [];
          _.forEach(apartments, (apartment) => {
            promises.push(new Promise((resolve, reject) => {
              apartment = apartment.toJSON();
              Favourite.findOne({
                where: {
                  userId: user.id,
                  apartmentId: apartment.id
                }
              }).then((fav) => {
                if (fav) {
                  apartment.favId = fav.id;
                  return resolve(apartment);
                }
                return resolve(apartment);
              }).catch((error) => {
                reject(error);
              });
            }));
          });

          return Promise.all(promises)
            .then((response) => {
              return response;
            })
        } else {
          return apartments;
        }
      })
      .then(respondWithResult(res))
      .catch(handleError(res));
  } else {
    return Apartment.findAll()
      .then((apartments) => {
        if (user) {
          let promises = [];
          _.forEach(apartments, (apartment) => {
            promises.push(new Promise((resolve, reject) => {
              apartment = apartment.toJSON();
              Favourite.findOne({
                where: {
                  userId: user.id,
                  apartmentId: apartment.id
                }
              }).then((fav) => {
                if (fav) {
                  apartment.favId = fav.id;
                  return resolve(apartment);
                }
                return resolve(apartment);
              }).catch((error) => {
                reject(error);
              });
            }));
          });

          return Promise.all(promises)
            .then((response) => {
              return response;
            })
        } else {
          return apartments;
        }
      })
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
