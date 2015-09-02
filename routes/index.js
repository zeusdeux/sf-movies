/* eslint new-cap: 0 */
'use strict';

const express       = require('express');
const d             = require('debug')('sfMovies:routes');
const movieLocModel = require('../models/movieLocationsModel');
let router          = express.Router();


/* GET home page */
router.get('/', function(_, res) {
  res.render('index', { dev: process.env.NODE_ENV !== 'production' });
});

/* GET <count> movie location objects, starting from <id> */
// a list of movie location objects is returned
router.get('/locations', (req, res, next) => {
  d('GET /locations: query %o', req.query);

  const count  = parseInt(req.query.count, 10) || 5;
  const fromId = parseInt(req.query.from || req.session.lastIdSent || 0, 10);

  d('GET /locations: count %d fromId %d', count, fromId);

  try {
    const data = movieLocModel.getSlice(fromId + count, fromId);

    d('GET /locations: data %o', data);

    req.session.lastIdSent = fromId + count;
    d('GET /locations: updates session %o', req.session);

    res.json(data);
  }
  catch(e) {
    next(e);
  }
});

/* GET completions */
// a filtered list of movie location objects is returned
router.get('/complete', (req, res, next) => {
  // type tells us the key we want to auto complete on
  // for example, if type === 'name' then we send valid
  // name completions.
  // type can be any valid key/column in the db
  const predicate = req.query.q;
  const type      = req.query.type;

  try {
    res.json(movieLocModel.filter(type, predicate));
  }
  catch(e) {
    next(e);
  }
});

/* POST lat, lang for a location. Add lat long to db for given location id */
router.post('/update/:id', (req, res, next) => {
  const lat   = req.body.lat; // get post param from body
  const long  = req.body.long; // get post param from body
  const locId = req.params.id;

  d('POST /update/:id: req body is %o', req.body);

  try {
    movieLocModel.update(locId, { lat, long });
    res.sendStatus(200);
  }
  catch(e) {
    next(e);
  }
});

module.exports = router;
