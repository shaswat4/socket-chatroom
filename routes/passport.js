var express = require('express');
const app = express();
var router = express.Router();
const bodyParser = require("body-parser");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

process.env.DEBUG = 'passport:*';

app.use(bodyParser.urlencoded({extended: true}));

var flash = require('connect-flash');
const { ObjectID } = require('bson');
const { isDataView } = require('util/types');
app.use(flash());

const { Sequelize, Op, Model, DataTypes } = require("sequelize");

const sequelize = new Sequelize('webapp', 'root', 'aaaa', {
  host: 'localhost',
  dialect: 'mysql'
});

const db = require('../models'); 

const Users = db.Users ;



app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

passport.use( 'local' , new LocalStrategy(
  async function(username, password, done) {
    Users.findOne({
      where : { 
        username : username ,  
        password : password
      }
    }).then( user => {
      
      if (!user) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
      // if (user.password !== password) {
      //   return done(null, false, { message: 'Incorrect password.' });
      // }
      return done(null, user);

    }).catch(err => done(err));

  }
));

passport.serializeUser(function (user, done) {
  process.nextTick(function () {
    done(null, { id: user.user_id, username: user.username });
  });
});


passport.deserializeUser(function (user, done) {
  process.nextTick(function () {
    return done(null, user);
  });
});

module.exports =passport; 
