var express = require('express');
const app = express();
var router = express.Router();
const bodyParser = require("body-parser");
// var passport = require('passport');
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
const Groups = db.Groups;
const Group_User = db.Group_User ;
const Chats = db.Chats ;


const passport = require('./passport');


function isSignedIn(req, res, next) {
    try {
      //no passport session
      if (!req.session.passport) {
        return res.redirect("/signin");
      }
    } catch (error) {
      return res.redirect("/signin");
    }
    next();
  }
  
  function p(params) {
    console.log(params);
  }


/* main routes */

router.get("/signin", function (req, res) {
    res.render("auth", { title: "Sign In", postSubmit: "signin" , message : req.flash("info") });
  });
  
  router.post("/signin",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/signin",
    })
  );
  
  router.get("/register", function (req, res) {
    res.render("auth", { title: "Register", postSubmit: "register" , message : req.flash("info") });
  });
  
  router.post("/register", async (req, res) => {
  
    let temp = await Users.findOne({where:{
      username : req.body.username
    }});
  
    if (temp){
      req.flash("info", "This username already exists");
      return res.redirect('/register');
    }
  
    await Users.create({ 
      username: req.body.username,
      password: req.body.password
    }).then(() => console.log("saved in db"));
  
    res.redirect("/signin");
  });
  
  router.post("/logout", function (req, res, next) {
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/signin");
    });
  });
  
module.exports = router;
