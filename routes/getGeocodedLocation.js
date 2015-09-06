'use strict';

const request             = require('request');
const geocodingApiKey     = process.env.GEOCODING_API_KEY;
const movieLocModel       = require('../models/movieLocationsModel');
const d                   = require('debug')('sfMovies:routes:getGeocodedLocations');
let googleGeocodingApiURL = 'https://maps.googleapis.com/maps/api/geocode/json?key=' + geocodingApiKey + '&';


// crash early if google geocoding api key is not set
if (!geocodingApiKey) throw new Error('No google api key found. Cannot make geocoding requests');

module.exports = (req, res, next) => {
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
};
