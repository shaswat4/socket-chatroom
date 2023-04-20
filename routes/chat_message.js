var express = require("express");
const app = express();
var router = express.Router();
const bodyParser = require("body-parser");
// var passport = require('passport');
var LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const { body, validationResult } = require("express-validator");

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
const Chat_Group = db.Chat_Group;
const Chat_Group_message = db.Chat_Group_message;
const ChatGroupIsGroup = db.ChatGroupIsGroup;
const Group_attribute = db.Group_attribute;

const passport = require("./passport");
const chat_group_message = require("../models/chat_group_message");
const { group } = require("console");
const { response } = require("express");
const { Template } = require("ejs");

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

/**
 * routes for the chat message actions
 */

/**
 * checks msg id , group id , logged user id
 * if every thing checks out
 * then delete message
 */
router.post("/delete", (req, res) => {
  let message_id = parseInt(req.body.message_id);
  let group_id = parseInt(req.body.group_id);
  let logged_user = req.session.passport.user;

  Chat_Group_message.destroy({
    where: {
      id: message_id,
      Chat_Group_id: group_id,
      user_id: logged_user.id,
    },
  })
    .then((count) => {
      p(`count ${count}`);
      res.send("success");
    })
    .catch((err) => {
      p(err);
      res.sendStatus(500);
    });
});

/**
 * checks grp id , msg id, user id
 * if everything checks out
 * then change message
 */
router.post("/edit", async (req, res) => {
  let message_id = parseInt(req.body.message_id);
  let group_id = parseInt(req.body.group_id);
  let message = req.body.message;
  let logged_user = req.session.passport.user;

  try {
    let msg = await Chat_Group_message.findOne({
      where: {
        id: message_id,
        Chat_Group_id: group_id,
        user_id: logged_user.id,
      },
    });

    if (msg == null) {
      return res.sendStatus(404);
    }

    msg.message = message;
    await msg.save();

    return res.sendStatus(200);
  } catch (error) {
    p(error);
    return res.sendStatus(500);
  }
});

module.exports = router;
