'use strict';

const test                = (validate) => (v) => validate(v);
const getLocations        = require('../routes/getLocations');
const getCompletions      = require('../routes/getCompletions');
const movieLocModel       = require('../models/movieLocationsModel');
const getGeocodedLocation = require('../routes/getGeocodedLocation');


describe('routes', function() {
  describe('#index', function() {
    describe('#getLocations', function() {
      it('should get a locations array of length == count from the given index', function(done) {
        let req = { query: { count: 5, fromIndex: 0 }, session: {} };
        let res = {
          json: test(data => {
            data.should.deepEqual(movieLocModel.getSlice(0, 5));
            req.session.lastIndexSent.should.be.exactly(5);
            done();
          })
        };

        getLocations(req, res, done);
      });

      it('should use the next handler when anything in the try block throws', function(done) {
        let req = { query: { count: 5, fromIndex: 0 }, session: {} };
        let res = {
          json: test(data => {
            data.should.deepEqual(movieLocModel.getSlice(0, 6));
            done(new Error('nope'));
          })
        };

        getLocations(req, res, () => done());
      });
    });
    describe('#getGeocodedLocation', function() {
      it('should geocode a location that doesn\'t have lat & long info', function(done) {
        // this test is going to make one real network request
        let req = { params: { locationId: '63D7FDEC-FFDA-461E-96BB-ECFB4CC7B93F' } };
        let res = {
          json: test(data => {
            data.should.deepEqual(movieLocModel.find(req.params.locationId));
            done();
          })
        };

        getGeocodedLocation(req, res, done);
      });
      it('should not make a geocode call if lat & long already present for location', function(done) {
        movieLocModel.update('9222AF38-EED0-4EDC-9FBA-EFC265D19021', { lat: 'this is', long: 'a test'});
        let req = { params: { locationId: '9222AF38-EED0-4EDC-9FBA-EFC265D19021' } };
        let res = {
          json: test(data => {
            data.lat.should.be.exactly('this is');
            data.long.should.be.exactly('a test');
            done();
          })
        };

        getGeocodedLocation(req, res, done);
      });
      it('should call next with error if anything in the try block throws', function(done) {
        // it'll throw as the location id (123) is invalid
        getGeocodedLocation({ params: { locationId: '123' }}, null, () => done());
      });
    });
    describe('#getCompletions', function() {
      it('should return completions based on query and ranked by name', function(done) {
        let req = { query: { q: '50'} };
        let res = {
          json: test(data => {
            data.should.deepEqual(movieLocModel.filter('name', req.query.q));
            done();
          })
        };

        getCompletions(req, res, done);
      });

      it('should return completions based on query and ranked by address', function(done) {
        let req = { query: { q: '20t', rankBy: 'address'} };
        let res = {
          json: test(data => {
            data.should.deepEqual(movieLocModel.filter(req.query.rankBy, req.query.q));
            done();
          })
        };

        getCompletions(req, res, done);
      });

      it('should call next with the error if anything in the try block throws', function(done) {
        let res = {
          json: test(() => {
            throw new Error('fail');
          })
        };

        getCompletions({ query: {q: 'wr'} }, res, () => done());
      });
    });
  });
});
