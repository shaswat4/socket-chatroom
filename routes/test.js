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

function getRandomNum() {
  return Math.floor(Math.random() * 10000000 + 1);
}


/*
* makes a new user admin based on following conditions :-
* if the number of admins in a group = 0
* then the oldest user in the group is made admin 
*/
async function setNewAdmin(group_id) {
  //finds number of admins for that group if 0 then proceeds
  let query = `select Chat_Group_id , sum(admin) as no_of_admins
  from chat_groups cg
  group by Chat_Group_id
  having Chat_Group_id = ${group_id} ;`;

  const [results, metadata] = await sequelize.query(query);

  p(metadata)
  let no_of_admins = results[0].no_of_admins;

  if (no_of_admins == 0) {
    // update the oldest created user to admin if
    // no of admin is zero

    await Chat_Group.update(
      { admin: true },
      {
        where: {
          Chat_Group_id: group_id,
        },
        order: [["createdAt", "ASC"]],
        limit: 1,
      }
    );
  }

  p(results);
}

/* main routes */

router.post("/1" , async (req , res)=>{
  let t = await Chat_Group.findAll({
    where:{
      user_id : 6, 
      Chat_Group_id : 2
    }
  })

  p(t);
  p( typeof(t)== null )
  p( typeof(t))
  console.log( t.user_id , typeof(t.user_id))
  res.send(t);
})

module.exports = router;
