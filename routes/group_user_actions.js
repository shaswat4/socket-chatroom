var express = require('express');
const app = express();
var router = express.Router();
const bodyParser = require("body-parser");
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


router.get("/addUser/:id", isSignedIn, async (req, res) => {
    let id = req.params.id;
  
    //time complexity n*m
  
    let grp = await Groups.findOne({ where: { group_id: id } });
  
    let query =
      "SELECT * , CASE WHEN user_id in " +
      "(select gu.user_id from group_users gu where group_id = " +
      grp.group_id +
      " ) THEN 1 ELSE 0 END AS joined FROM `users`; ";
  
    const [results, metadata] = await sequelize.query(query);
  
    res.render("editGroupUser", { userList: results, group: grp });
  });
  
  router.post("/addUser/:id", isSignedIn, async (req, res) => {
    let grpId = req.params.id;
    p(grpId);
    let userList = Object.keys(req.body);
    p(userList);
  
    try {
      let selected_users = await Users.findAll({
        attributes: ["user_id", "username"],
        where: {
          username: {
            [Op.in]: userList,
          },
        },
      });
  
      // selected_users.forEach((ele) => {
      //   p(ele.user_id);
      // });
  
      for (let index = 0; index < selected_users.length; index++) {
        const ele = selected_users[index];
  
        await Group_User.findOrCreate({
          where: {
            group_id: grpId,
            user_id: ele.user_id,
          },
          defaults: {
            isAdmin: false,
            username: ele.username,
          },
        });
      }
    } catch (error) {
      p(error);
    }
  
    res.redirect("/group/" + grpId);
  });
  
  router.get("/removeUser/:id", isSignedIn, async (req, res) => {
    let id = req.params.id;
  
    let grp = await Groups.findOne({
      where: {
        group_id: id,
      },
    });
  
    let query =
      `select user_id , username  from users where user_id in 
    (select user_id from group_users where group_id = ` +
      grp.group_id +
      ` );`;
  
    const [results, metadata] = await sequelize.query(query);
  
    res.render("removeGroupUser", { userList: results, group: grp });
  });
  
  router.post("/removeUser/:id", isSignedIn, async (req, res) => {
    let grpId = req.params.id;
    p(grpId);
    let userList = Object.keys(req.body);
    p(userList);
  
    try {
      let grp = await Groups.findOne({
        where: {
          group_id: grpId,
        },
      });
  
      let usr = await Users.findAll({
        attributes: ["user_id"],
        where: {
          username: {
            [Op.in]: userList,
          },
        },
      });
  
      let userIds = usr.map((user) => user.user_id);
  
      await Group_User.destroy({
        where: {
          group_id: grp.group_id,
          user_id: {
            [Op.in]: userIds,
          },
        },
      });
  
      req.flash("info", "users removed from group");
    } catch (error) {
      p(error);
    }
  
    res.redirect("/group/" + grpId);
  });

  module.exports = router;
