const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

const { sessionSecret } = require('./config');
const { sequelize } = require('./db/models');
const { restoreUser } = require('./auth');

const SequelizeStore = require('connect-session-sequelize')(session.Store);
const store = new SequelizeStore({ db: sequelize });

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const welcomeRouter = require('./routes/welcome');
const searchRouter = require('./routes/search');
const questionsRouter = require('./routes/questions');
const topicsRouter = require('./routes/topics')
const commentsRouter = require('./routes/comments')
const questionFormRouter = require('./routes/question-form')

const app = express();

// view engine setup
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(cookieParser(sessionSecret));
app.use(
  session({
    secret: sessionSecret,
    store,
    saveUninitialized: false,
    resave: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// set up session middleware
app.use(restoreUser);


// create Session table if it doesn't already exist
store.sync();

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/welcome', welcomeRouter);
app.use('/search', searchRouter);
app.use('/question-form', questionFormRouter);
app.use('/topics', topicsRouter);
app.use('/comments', commentsRouter);
app.use('/questions', questionsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error-page');
});

module.exports = app;
