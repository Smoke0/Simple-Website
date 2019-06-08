var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose  = require('mongoose');
var session = require('express-session');
var uuid = require('uuid');
var filestore =  require('session-file-store')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var User = require('./models/User');

// importing routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var notificationRouter = require('./routes/notification');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session setup
app.use(session({
    genid:(req)=>{return uuid()},
    store: new filestore(),
    secret:'our secret',
    resave:false,
    saveUninitialized: true
}));

// passport set up
passport.use(new LocalStrategy(
    {usernameField:'email'},
    (email,password,done)=>{

        User.findOne({email:email}).exec(function (err,user) {
            if(!user){
                return done(null,false,{message:"No user exists"})
            }
            bcrypt.compare(password,user.password).then(function (result) {
                    if (!result){
                        return done(null,false,{message:"Invalid password"});
                    }
                    else{
                        return done(null,user);
                    }
            });
        });
}
));

// attaches a user to a req session.
passport.serializeUser(function(user,done){
    done(null,user.id);
});

passport.deserializeUser(function (id,done) {
    User.findById(id).then(function (user) {
        if (user===null){done(new Error('Wrong id'))}
        done(null,user);
    }).catch(function (err) {
        done(err);
    })
});

app.use(passport.initialize());
app.use(passport.session());

//db setput
var mongoDB = 'mongodb://localhost:27017/fcc'; // mongodb for website to use
mongoose.connect(mongoDB,{useNewUrlParser:true});
var db = mongoose.connection;
db.on('error',console.error.bind(console,"MongoDB connection error: "));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/notification',notificationRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
