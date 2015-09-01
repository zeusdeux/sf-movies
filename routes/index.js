'use strict';

/* eslint new-cap: 0 */

const express       = require('express');
const movieLocModel = require('../models/movieLocationsModel');
const d             = require('debug')('routes');
let router          = express.Router();


/* GET home page */
router.get('/', function(_, res) {
  res.render('index', { dev: process.env.NODE_ENV !== 'production' });
});

/* GET <count> movie location objects, starting from <id> */
// a list of movie location objects is returned
router.get('/locations', (req, res, next) => {
  try {
    const count    = req.query.count || 5;
    const offsetId = req.query.offset || req.session.lastIdSent || 0;
    const data     = movieLocModel.get(count, offsetId);

    d('count %d offsetId %d\ndata %o', data);
    req.session.lastIdSent = offsetId + count;
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
  const type = req.query.type;
  const predicate = req.query.q;

  try {
    res.json(movieLocModel.filter(type, predicate));
  }
  catch(e) {
    next(e);
  }
});

/* POST lat, lang for a location. Add lat long to db for given location id */
router.post('/update/:id', (req, res, next) => {
  const locId = req.params.id;
  const lat = req.query.lat;
  const long = req.query.long;

  try {
    movieLocModel.update(locId, { lat, long });
    res.sendStatus(200);
  }
  catch(e) {
    next(e);
  }
});

module.exports = router;
