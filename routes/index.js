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
const User = mongoose.model('user', { username : String , password : String  });
const Group = mongoose.model('group', {
  name : {
    type: String,
    required: true
   },
  description : String , 
  admin : [ {username :String}] , 
  users : [ {username :String}]
});


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

router.get("/", isSignedIn, function (req, res, next) {
  try {
    console.log(req.session);
  } catch (error) {}
  res.render("index", { title: "Home", message: req.flash("info") });
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

router.get("/group/:id", isSignedIn, function (req, res) {

  let id = req.params.id; 

  Group.findById( id , (err , obj)=>{
    if (err){ p(err);}
    if (!obj){
      //not found
      req.flash("info","group dosent exist at this url");
      res.render('404' , {message : req.flash('info')})
    } else {
      res.render("index", { id : obj._id ,  title: obj.name, message: req.flash("info") });
    }
  });

});

router.post("/", isSignedIn, (req, res) => {
  console.log(req.body.roomName);
  res.redirect("/group/" + req.body.roomName);
});

module.exports = router;
