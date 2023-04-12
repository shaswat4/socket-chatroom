var express = require("express");
const app = express();
var router = express.Router();
const bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
var GoogleStrategy = require("passport-google-oauth20").Strategy;
const _ = require("lodash")
require("dotenv").config();

process.env.DEBUG = "passport:*";

app.use(bodyParser.urlencoded({ extended: true }));

var flash = require("connect-flash");
const { ObjectID } = require("bson");
const { isDataView } = require("util/types");
app.use(flash());

const { Sequelize, Op, Model, DataTypes } = require("sequelize");

const db = require("../models");

const sequelize = db.sequelize;

const Users = db.Users;

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

function create_username(name) {
  let newStr = _.snakeCase(name) + _.random(4, 10000);
  return newStr;
}

passport.use(
  "local",
  new LocalStrategy(async function (text, password, done) {
    // console.log('\n\n\n')
    // console.log(text)
    // console.log(passport)
    Users.findOne({
      where: {
        [Op.or]: [
          {
            username: text,
          },
          {
            email: text,
          },
        ],
        password: password,
      },
    })
      .then((user) => {
        if (!user) {
          return done(null, false, {
            message: "Incorrect username or password.",
          });
        }
        // if (user.password !== password) {
        //   return done(null, false, { message: 'Incorrect password.' });
        // }
        // console.log(user)
        return done(null, user);
      })
      .catch((err) => done(err));
  })
);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      // console.log(profile);
      // console.log(accessToken);
      // console.log(refreshToken);

      //search users with email
      let user = await Users.findOne({
        where: {
          email: profile.emails[0].value,
        },
      });

      // if email exists
      if (user != null) {
        console.log(user);
        return cb(null, user);
      }

      const username = create_username(profile.displayName);

      // creates user record
      user = await Users.create({
        username: username,
        password: null,
        email: profile.emails[0].value,
        type: "g",
      });

      return cb(null , user)

      cb(null);
      // Users.findOrCreate({ googleId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });
    }
  )
);

passport.serializeUser(function (user, done) {
  process.nextTick(function () {
    done(null, {
      id: user.user_id,
      username: user.username,
      email: user.email,
    });
  });
});

passport.deserializeUser(function (user, done) {
  process.nextTick(function () {
    return done(null, user);
  });
});

module.exports = passport;
