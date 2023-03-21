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



/* Other routes */


router.get('/abc' , async (req , res)=>{

  let t = await Users.findAll({
    //attributes : ['']
    where : {
      user_id : 6
    }
  });
  
  //p(t[0].username)
  //p(t[0])
  p(t)

  
  p(typeof(t[0]))
  
  // t.forEach( ele =>{
  //   ele = JSON.parse(JSON.stringify(ele))
  //   ele.joined = false ;
  // })

  let query = 'SELECT * ,' + 
  'CASE ' +
  'WHEN user_id in ' +
  '(select gu.user_id from group_users gu where group_id = 1 ) '+
  'THEN 1 '+
  'ELSE 0 '+
  'END AS joined '+
  'FROM `users`; '

  const [results, metadata] = await sequelize.query(
    query
  );


  let grps = await Groups.findAll({});


  
  //res.send(req.session.passport);
  res.send( results )

})


router.get("/", isSignedIn, async function (req, res, next) {
  
  let home_id =  1 ;

  try {
    

    let obj = await Groups.findOne({ where : {group_id : home_id}});
    let chat = await Chats.findAll({ where : { group_id :home_id } });

    if (!obj){
      //not found
      req.flash("info","group dosent exist at this url");
      res.render('404' , {message : req.flash('info')})
    } 
    else {
      let t = req.session.passport.user;
      res.render("index", { 
        id : obj.group_id ,  
        title: obj.name, 
        message: req.flash("info") ,
        user_id : t.id , 
        username : t.username , 
        chats : chat 
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
  
  //res.render("index", { title: "Home", message: req.flash("info") });
});






router.get("/groupList", isSignedIn, async function (req, res) {
  let grps = await Groups.findAll({});

  if (grps) {
    //p( grps );
    res.render("groupList", { groupList: grps, message: req.flash("info") });
  } else {
    return res.status(500).send("Internal server error");
  }
});



router.get("/group/:id", isSignedIn, async function (req, res) {
  let id = req.params.id;

  try {
    let obj = await Groups.findOne({
      where: {
        group_id: id,
      },
    });

    let chat = await Chats.findAll({
      where: {
        group_id: id,
      },
    });

    if (!obj) {
      //not found
      req.flash("info", "group dosent exist at this url");
      res.render("404", { message: req.flash("info") });
    } else {
      let t = req.session.passport.user;
      res.render("index", {
        id: obj.group_id,
        title: obj.name,
        message: req.flash("info"),
        user_id: t.id,
        username: t.username,
        chats: chat,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/userList", isSignedIn, async (req, res) => {
  let users = await Users.findAll({});

  res.render("userList", { users: users });
});


router.post("/", isSignedIn, (req, res) => {
  console.log(req.body.roomName);
  res.redirect("/group/" + req.body.roomName);
});

module.exports = router;
