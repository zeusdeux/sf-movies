'use strict';

const movieLocModel = require('../models/movieLocationsModel');
const d             = require('debug')('sfMovies:routes:getLocations');


module.exports = (req, res, next) => {
  d('GET /locations: query %o', req.query);

  const count   = parseInt(req.query.count, 10) || 5;
  let fromIndex = parseInt(req.query.from, 10);

  fromIndex = isNaN(fromIndex) ? req.session.lastIndexSent || 0 : fromIndex;

  d('GET /locations: count %d fromIndex %d', count, fromIndex);

  try {
    const data = movieLocModel.getSlice(fromIndex, fromIndex + count);

    d('GET /locations: data %o', data);

    req.session.lastIndexSent = fromIndex + count;
    d('GET /locations: updates session %o', req.session);

    res.json(data);
  }
  catch(e) {
    next(e);
  }
};
