'use strict';

const movieLocModel = require('../models/movieLocationsModel');
const d             = require('debug')('sfMovies:routes:getCompletions');


module.exports = (req, res, next) => {
  // type tells us the key we want to auto complete on
  // for example, if type === 'name' then we send valid
  // name completions.
  // type can be any valid key/column in the db
  const query  = req.query.q;
  const rankBy = req.query.rankBy;

  d('GET /complete: rankBy %s query %s', rankBy, query);

  try {
    // rank by name by default. Also supports 'address' and any other valid key
    // that has a corresponding string value in the db
    const completions = movieLocModel.filter(rankBy || 'name', query);

    d('GET /complete: completions: %o', completions);
    res.json(completions);
  }
  catch(e) {
    next(e);
  }
};
