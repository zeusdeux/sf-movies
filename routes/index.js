/* eslint new-cap: 0 */
'use strict';

const express             = require('express');
let router                = express.Router();

const getLocations        = require('./getLocations');
const getCompletions      = require('./getCompletions');
const getGeocodedLocation = require('./getGeocodedLocation');


/* GET home page */
router.get('/', function(_, res) {
  res.render('index', { dev: process.env.NODE_ENV !== 'production' });
});

/* GET <count> movie location objects, starting from <index> */
// Returns a list of movie location objects
router.get('/locations', getLocations);

/* GET geocoded location given a valid location id */
// Returns a full location object with lat, long filled in
router.get('/geocode/:locationId', getGeocodedLocation);

/* GET completions */
// Returns a filtered list of movie location objects
// Objects are filtered by query and ranked by type
// Type can be name or address. Defaults to name
router.get('/complete', getCompletions);

module.exports = router;
