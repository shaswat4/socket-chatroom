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

router.get("/createGroup", isSignedIn, function (req, res) {
  res.render("createGroup", { message: req.flash("info") });
});

router.post("/createGroup", isSignedIn, async (req, res) => {
  const name = req.body.groupName;
  const description = req.body.description;
  const username = req.session.passport.user.username;

  p(username);

  try {
    if (name === null || name === undefined || name === "") {
      throw "name not defined";
    }

    let grp = await Groups.findOne({
      where: {
        name: name,
      },
    });

    if (grp) {
      // group object exixsts

      p("group with this name already existes");
      req.flash("info", "group with this name already existes");
      res.redirect("/createGroup");
    } else {
      let new_grp = await Groups.create({
        name: name,
        description: description,
      });

      let temp_user = await Users.findOne({
        where: { username: username },
      });

      await Group_User.create({
        isAdmin: true,
        group_id: new_grp.group_id,
        user_id: temp_user.user_id,
        username: username,
      });

      res.redirect("/group/" + new_grp.group_id);
    }
  } catch (error) {
    p(error);
    res.redirect("/");
  }
});

router.post("/joinGroup", isSignedIn, async function (req, res) {
  const username = req.session.passport.user.username;
  const grpName = req.body.room;

  try {
    //finds group and user object
    const grp = await Groups.findOne({
      where: { name: grpName },
    });

    p(grp);

    const usr = await Users.findOne({
      where: {
        username: username,
      },
    });

    p(usr);

    if (grp) {
      // group object exists

      let userFound = await Group_User.findAll({
        where: {
          group_id: grp.group_id,
          user_id: usr.user_id,
        },
      });

      if (userFound !== []) {
        // user not found in group, add user

        let new_grp = await Group_User.create({
          group_id: grp.group_id,
          user_id: usr.user_id,
        });

        return res.redirect("/group/" + new_grp.group_id);
      } else {
        //user already in group
        req.flash("info", "user is already in group");
        return res.redirect("/group/" + new_grp.group_id);
      }
    } else {
      // group object doesn't exist
      req.flash("info", "group doesn't exist please create it first");
      return res.redirect("/createGroup");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

router.get("/editGroup/:id", isSignedIn, async function (req, res) {
  let id = req.params.id;

  try {
    const grp = await Groups.findOne({
      where: {
        group_id: id,
      },
    });

    if (grp) {
      // group object exists => updates
      p(grp);
      res.render("editGroup", { message: req.flash("info"), group: grp });
    } else {
      // group object doesn't exist
      req.flash(
        "info",
        "group doesn't exist please create it first before editing"
      );
      return res.redirect("/createGroup");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

router.post("/editGroup/:id", isSignedIn, async function (req, res) {
  let id = req.params.id;

  try {
    //if group name empty => reload
    if (req.body.groupName == "") {
      req.flash("info", "You cannot leave the group name empty!");
      return res.redirect("/editGroup/" + id);
    }

    const grp = await Groups.update(
      {
        name: req.body.groupName,
        description: req.body.description,
      },
      {
        where: {
          group_id: id,
        },
      }
    );

    if (grp) {
      // group object exists => redirects to group page

      res.redirect("/group/" + id);
    } else {
      // group object doesn't exist
      req.flash(
        "info",
        "group doesn't exist please create it first before editing"
      );
      return res.redirect("/createGroup");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

router.post("/deleteGroup/:id", isSignedIn, async function (req, res) {
  let id = req.params.id;

  try {
    const temp = await Group_User.destroy({
      where: {
        group_id: id,
      },
    });

    const grp = await Groups.destroy({
      where: {
        group_id: id,
      },
    });

    p(grp);

    if (grp) {
      //groups obj exists

      return res.redirect("/groupList");
    } else {
      //group object dosent exist
      req.flash(
        "info",
        "group dosen't exist, please check name before deleating"
      );
      return res.redirect("/groupList");
    }
  } catch (error) {
    p(error);
    return res.status(500).send("Internal server error");
  }

  res.redirect("/groupList");
});

module.exports = router;
