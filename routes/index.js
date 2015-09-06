/* eslint new-cap: 0 */
'use strict';

const express             = require('express');
const request             = require('request');
const geocodingApiKey     = process.env.GEOCODING_API_KEY;
const d                   = require('debug')('sfMovies:routes');
const movieLocModel       = require('../models/movieLocationsModel');
let router                = express.Router();
let googleGeocodingApiURL = 'https://maps.googleapis.com/maps/api/geocode/json?key=' + geocodingApiKey + '&';


// crash early if google geocoding api key is not set
if (!geocodingApiKey) throw new Error('No google api key found. Cannot make geocoding requests');

/* GET home page */
router.get('/', function(_, res) {
  res.render('index', { dev: process.env.NODE_ENV !== 'production' });
});

/* GET <count> movie location objects, starting from <index> */
// a list of movie location objects is returned
router.get('/locations', (req, res, next) => {
  d('GET /locations: query %o', req.query);

  const count   = parseInt(req.query.count, 10) || 5;
  let fromIndex = parseInt(req.query.from, 10);

  fromIndex = isNaN(fromIndex) ? req.session.lastIndexSent || 0 : fromIndex;

  d('GET /locations: count %d fromIndex %d', count, fromIndex);

  try {
    const data = movieLocModel.getSlice(fromIndex + count, fromIndex);

    d('GET /locations: data %o', data);

    req.session.lastIndexSent = fromIndex + count;
    d('GET /locations: updates session %o', req.session);

    res.json(data);
  }
  catch(e) {
    next(e);
  }
});


/* GET geocoded location given a valid location id */
router.get('/geocode/:locationId', (req, res, next) => {
  const locationId = req.params.locationId;

  d('GET /geocode/:locationId: %s', locationId);

  try {
    // find is synchronous for now since the simple in-memory db,
    // being a map, can look up the id in constant time
    const loc = movieLocModel.find(locationId);

    // if location already has lat and long, return it as is
    // else geocode it using the google api
    if (loc.lat && loc.long) res.json(loc);
    else {
      // get rid of 'from <whatever>' which is seen in some addresses
      // append SF, CA just in case the address doesn't have it
      // Even if they get repeated, Google ignores the repeated state and city name anyway
      const address = encodeURIComponent(loc.address.split(/\bfrom\b/i)[0].trim() + ', San Francisco, CA');

      // make request to google's geocoding api for the given address
      request(googleGeocodingApiURL + 'address=' + address, function(err, response, body) {
        d('GET /geocode/:locationId: Request url %s', googleGeocodingApiURL + 'address=' + address);
        d('GET /geocode/:locationId: In request callback. location id is %s', locationId);
        d('GET /geocode/:locationId: address %s', address);
        d('GET /geocode/:locationId: body', body);

        try {
          if (err) throw err;
          if (response.statusCode >= 200 && response.statusCode < 300) {
            body = JSON.parse(body); // JSON parse since we are hitting the JSON endpoint

            d('GET /geocode/:locationId: google response status %s', body.status);
            d('GET /geocode/:locationId: lat, long: %o', body.results[0].geometry.location);

            if ('OK' === body.status) {
              const location = body.results[0].geometry.location;

              loc.lat = location.lat;
              loc.long = location.lng;

              movieLocModel.update(loc.id, loc);
              res.json(loc);
            } else throw new Error('Could not geocode location');
          } else throw new Error(response.statusMessage);
        }
        catch(e) {
          next(e);
        }
      });
    }
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
  const query  = req.query.q;
  const rankBy = req.query.rankBy;

  d('GET /complete: rankBy %s query %s', rankBy, query);

  try {
    // rank by name by default
    const completions = movieLocModel.filter(rankBy || 'name', query);

    d('GET /complete: completions: %o', completions);
    res.json(completions);
  }
  catch(e) {
    next(e);
  }
});

module.exports = router;
