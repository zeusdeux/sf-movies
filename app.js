const path         = require('path');
const logger       = require('morgan');
const express      = require('express');
// const favicon   = require('serve-favicon');
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const session      = require('express-session');

const app          = express();
const routes       = require('./routes/index');

const omgSecret    = 'e1uRhhMyUzdnAkB/IV7DhaHv0O5C5HbTsjSCDs6IN8aCIPCz6EDJ2aXHqm9WDo5JqbOPR8R8sjhmBlxYuEqbhHugDHk6pPmJOxr3PmDHFTlldNrQZDiHSxhBSqp8CLCsYMwauo0CqVkYzDtG+NGlVyo9flmUq2eTihvVx2T++aE=';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// view cache is auto enabled in production

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser({
  secret: omgSecret
}));
app.use(session({
  secret: omgSecret,
  name: 'sf-movies-cookie',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');

  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, _, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, _, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
