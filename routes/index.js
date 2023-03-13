var express = require('express');
const app = express();
var router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

process.env.DEBUG = 'passport:*';

app.use(bodyParser.urlencoded({extended: true}));

var flash = require('connect-flash');
const { ObjectID } = require('bson');
const { isDataView } = require('util/types');
app.use(flash());

mongoose.set( 'strictQuery' , true);
mongoose.connect('mongodb://127.0.0.1:27017/test');
const User = require('../models/user');
const Group = require('../models/group')

const Chat = require('../models/chat');


const { Sequelize, Op, Model, DataTypes } = require("sequelize");


const sequelize = new Sequelize('webapp', 'root', 'aaaa', {
  host: 'localhost',
  dialect: 'mysql'
});


class Users extends Model {}

Users.init({
  // Model attributes are defined here
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  username: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(20),
    allowNull : false
  }
}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'User', // We need to choose the model name
  timestamps : false
});




sequelize.sync({ alter: true });

// the defined model is the class itself
console.log(User === sequelize.models.User); // true




app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

passport.use( 'local' , new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username : username }, 
      function (err ,  user) {
        if (err) {
          return done(err); }
        if (!user) { 
          return done(null, false); }
        if (! (user.password === password) ) {
          //console.log("inside validator");
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    });
  }
));

passport.serializeUser(function (user, done) {
  process.nextTick(function () {
    done(null, { id: user.id, username: user.username });
  });
});

/*
passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
*/

passport.deserializeUser(function (user, done) {
  process.nextTick(function () {
    return done(null, user);
  });
});


function loggedIn(req, res, next) {
  try {
    if (req.session.passport){
      console.log("next");
      next();
    }
  } catch (error) {
    res.redirect('/signin');
  }
  //res.redirect('/signin');
}

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

/* Auth routes */

router.get("/signin", function (req, res) {
  res.render("auth", { title: "Sign In", postSubmit: "signin" });
});

router.post("/signin",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/signin",
  })
);

router.get("/register", function (req, res) {
  res.render("auth", { title: "Register", postSubmit: "register" });
});

router.post("/register", (req, res) => {
  const temp = new User({
    username: req.body.username,
    password: req.body.password,
  });
  temp.save().then(() => console.log("saved in db"));

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

/* Other routes */

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

    let grp = await Group.findOne({ name: name });

    if (grp) {
      // group object exixsts

      p("group with this name already existes");
      req.flash("info", "group with this name already existes");
      res.redirect("/createGroup");

    } else {

      var temp = new Group({
      name: name,
      description: description,
      admin: [{ username: username }],
      users: [{ username: username }],
      });

      await temp.save(); 
      p(temp)

      res.redirect('/group/'+temp._id);
    }

    //p('fsgjkllslslsl,sloooooooooooooooooooooooooooooooooo')

  } catch (error) {
    //p('sjsbjsnskns');
    p(error);
    res.redirect("/");
  }


});

// router.get('/abc' , isSignedIn , (req , res)=> {
//   Group.find({name : "abc"} , (err , ans)=>{
//     p('ppppppppppppppp');
//     p(ans[0]._id);
//     // res.send(ans[0]._id);
//     res.render('temp' , {temp : ans[0]._id})
//   });
// })

router.get("/", isSignedIn, async function (req, res, next) {
  
  let home_id = '6406c87828ee89f2242c89a4';

  try {
    
    let obj = await Group.findById(home_id);

    let chat = await Chat.find({group : mongoose.Types.ObjectId(home_id) }).sort({ timestamp : "ascending"});



    if (!obj){
      //not found
      req.flash("info","group dosent exist at this url");
      res.render('404' , {message : req.flash('info')})
    } else {
      let t = req.session.passport.user;
      res.render("index", { id : obj._id ,  title: obj.name, message: req.flash("info") ,
      user_id : t.id , username : t.username , chats : chat });
    }

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
  
  //res.render("index", { title: "Home", message: req.flash("info") });
});




router.post("/joinGroup", isSignedIn, async function (req, res) {
  const username = req.session.passport.user.username;
  const grpName = req.body.room;

  try {
    const grp = await Group.findOne({ name: grpName }).exec();
    
    if (grp) {
      // group object exists
      const userFound = grp.users.some((user) => user.username === username);

      let idString = grp._id.toString();

      if (!userFound) {
        // user not found in group, add user
        await Group.updateOne(
          { _id: grp._id },
          { $push: { users: { username: username } } }
        ).exec();
        return res.redirect("/group/" + idString);
      } else {
        //user already in group
        req.flash("info", "user is already in group");
        return res.redirect("/group/" + idString);
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

router.get("/groupList", isSignedIn, function (req, res) {
  Group.find({}, "name description _id", function (err, result) {
    if (err) {
      p(err);
    }
    if (result) {
      //p(result);
      res.render("groupList", { groupList: result , message : req.flash("info") });
    } else {
      return res.status(500).send("Internal server error");
    }
  });
  //return res.status(500).send('Internal server error');
});

router.get("/editGroup/:id", isSignedIn, async function (req, res) {
  let id = req.params.id;

  try {
    const grp = await Group.findById( id );

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

    if ( req.body.groupName == '' ){
      req.flash(
        "info",
        "You cannot leave the group name empty!"
      );
      return res.redirect('/editGroup/' + id);
    }

    const grp = await Group.findByIdAndUpdate( id , 
      { $set: { description: req.body.description , name : req.body.groupName }});
    
    //p( { description: req.body.description , name : req.body.groupName } );
    
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
  console.log("ksakmska");

  try {
    const grp = await Group.findByIdAndDelete( id );

    p(grp)

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

router.get("/group/:id", isSignedIn, async function (req, res) {

  let id = req.params.id; 

  try {

    let obj = await Group.findById( id );

    let chat = await Chat.find({group : mongoose.Types.ObjectId(id) }).sort({ timestamp : "ascending"});


    p(obj);
    if (!obj){
      //not found
      req.flash("info","group dosent exist at this url");
      res.render('404' , {message : req.flash('info')})
    } else {
      let t = req.session.passport.user;
      res.render("index", { id : obj._id ,
        title: obj.name, message: req.flash("info") ,
        user_id : t.id , username : t.username , chats : chat });
    }

    
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }

});

router.get('/userList' , isSignedIn , async (req , res)=> {

  let users = await User.find().select({_id : 1  , username : 1 });

  p(users);

  newUsers = [];

  for (let index = 0; index < users.length; index++) {
    const ele = users[index];
    //if username exists
    if ( !!ele.username){
      newUsers.push( ele );
    }
    
  }

  res.render( 'userList' , {users : newUsers} );

});

router.get( "/group/addUser/:id" , isSignedIn , async (req , res)=> {
  let id = req.params.id ;

  //time complexity n*m

  let userList = await User.find().select({_id : 1  , username : 1 });
  let grp   = await Group.findById( id );
  
  newUsers = [];

  for (let index = 0; index < userList.length; index++) {
    const ele = userList[index];
    //if username exists
    if ( !!ele.username){
      //cant add joined field without it 
      let temp = JSON.parse(JSON.stringify(ele));
      newUsers.push( temp );
    }
  }

  //p(newUsers);

  newUsers.forEach(ele => {
    ele.joined= false;
  });

  for (let index = 0; index < grp.users.length; index++) {
    const ele = grp.users[index].username;
    //if username exists
    let found = false ;
    for (let i = 0; i < newUsers.length; i++) {
      const temp = newUsers[i];

      if ( temp.username === ele ){
        found = true;
        newUsers[i].joined = true;
        break;
      }

    }
  }

  res.render( 'editGroupUser' , { userList : newUsers , group : grp } );
  
});

router.post( '/group/addUser/:id' , isSignedIn , async ( req  , res) => {
  let grpId = req.params.id ;
  p(grpId)
  let userList = Object.keys(req.body);

  try {
    
    let grp = await Group.findById(grpId);
    let grpUsers = [];

    /* filters list */
    grp.users.forEach(e => {
      grpUsers.push(e.username); 
    });

    var filteredUsers = userList.filter( function(e) { 
      return  !grpUsers.includes(e)
    });

    p(userList);
    p(grpUsers);
    p(filteredUsers);

    // adds all elemets in filted list onto db
    for (let index = 0; index < filteredUsers.length; index++) {
      const element = filteredUsers[index];

      await Group.updateOne(
        { _id: grpId },
        { $push: { users: { username: element } } }
      );
      
    }

    req.flash("info","users added to the group");



  } catch (error) {
    p(error);

  }

  res.redirect('/group/' + grpId);
});

router.get( '/group/removeUser/:id' , isSignedIn , async (req , res) => {

  let id = req.params.id ;

  //time complexity n*m

  let userList = await User.find().select({_id : 1  , username : 1 });
  let grp   = await Group.findById( id );
  
  newUsers = [];

  for (let index = 0; index < userList.length; index++) {
    const ele = userList[index];
    //if username exists
    if ( !!ele.username){
      //cant add joined field without it 
      let temp = JSON.parse(JSON.stringify(ele));
      temp.joined = false ;
      newUsers.push( temp );
    }
  }

  let filteredUsers = [];

  //itterates with group users
  for (let index = 0; index < grp.users.length; index++) {
    const ele = grp.users[index].username;
    
    //itterrates with all user list and maps group users with user object ids 
    for (let i = 0; i < newUsers.length; i++) {
      const temp = newUsers[i];

      if ( temp.username === ele ){
        found = true;

        filteredUsers.push( temp );
        newUsers[i].joined = true;
        break;
      }

    }
  }

  res.render( 'removeGroupUser' , { userList : filteredUsers , group : grp } );
  

});

router.post( '/group/removeUser/:id' , isSignedIn , async ( req  , res) => {
  let grpId = req.params.id ;
  p(grpId)
  let userList = Object.keys(req.body);
  

  try {
    
    let grp = await Group.findById(grpId);
    let grpUsers = [];

    /* filters list */
    // grp.users.forEach(e => {
    //   grpUsers.push(e.username); 
    // });

    // var filteredUsers = userList.filter( function(e) { 
    //   return  !grpUsers.includes(e)
    // });

    p(userList);
    p(grpUsers);
    //p(filteredUsers);

    let temp = await Group.updateOne(
      { _id: grpId },
      { $pull: { 
        admin: { username: { $in: userList } }, 
        users: { username: { $in: userList } } 
      }});
    
    
    // // adds all elemets in filted list onto db
    // for (let index = 0; index < filteredUsers.length; index++) {
    //   const element = filteredUsers[index];

    //   await Group.updateOne(
    //     { _id: grpId },
    //     { $push: { users: { username: element } } }
    //   );
      
    // }

    req.flash("info","users removed from group");



  } catch (error) {
    p(error);

  }

  res.redirect('/group/' + grpId);

  //res.send( userList );
});



router.post("/", isSignedIn, (req, res) => {
  console.log(req.body.roomName);
  res.redirect("/group/" + req.body.roomName);
});

module.exports = router;
