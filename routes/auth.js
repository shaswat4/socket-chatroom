var express = require("express");
const app = express();
var router = express.Router();
const bodyParser = require("body-parser");
// var passport = require('passport');
var LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

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
const Groups = db.Groups;
const Group_User = db.Group_User;
const Chats = db.Chats;

const passport = require("./passport");

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
  res.render("signin", {
    title: "Sign In",
    postSubmit: "signin",
    message: req.flash("info"),
  });
});

router.post(
  "/signin",
  passport.authenticate("local", {
    successRedirect: "/chat",
    failureRedirect: "/signin",
  })
);

router.get("/register", function (req, res) {
  res.render("register", {
    title: "Register",
    postSubmit: "register",
    message: req.flash("info"),
  });
});

/**
 * registers users
 * takes email , username , password
 * registers if email isn't present in db
 * and if username dosen't exist
 *
 */
router.post("/register", async (req, res) => {
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;

  let temp = await Users.findOne({
    where: {
      [Op.or]: [
        {
          username: username,
        },
        {
          email: email,
        },
      ],
    },
  });

  //record exists
  // && !(temp.type.includes("l"))
  if (temp != null) {
    // if username exists
    if (temp.username != null && temp.username == username) {
      req.flash(
        "info",
        "This username already exists please choose another one"
      );
      return res.redirect("/register");
    }

    // if email exists
    if (temp.email != null && temp.email.length > 0 && temp.email == email) {
      req.flash("info", "This email is already registered!");
      return res.redirect("/register");
    }
  }

  await Users.create({
    username: username,
    password: password,
    email: email,
    type: "l",
  }).then(() => console.log("user saved in db"));

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

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/signin" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/chat");
  }
);

module.exports = router;
