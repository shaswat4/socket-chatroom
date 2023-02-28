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
app.use(flash());

mongoose.set( 'strictQuery' , true);
mongoose.connect('mongodb://127.0.0.1:27017/test');
const User = mongoose.model('user', { username : String , password : String  });
const Group = mongoose.model('group', { name : String ,
  description : String , 
  admin : [ {username : String} ] , 
  users : [ {username : String}]
});


app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

passport.use( 'local' , new LocalStrategy(
  function(username, password, done) {
    //console.log("aaaa");
    User.findOne({ username : username }, 
      function (err ,  user) {
        //console.log( err , 'sknk' ,user);
        //console.log(username , password);
        //console.log(user.username , user.password);
        //console.log('hello');
        if (err) {
          //console.log("inside err");
          return done(err); }
        if (!user) { 
          //console.log("inside !user");
          //console.log(done(null, false));

          return done(null, false); }
        //if (!user.verifyPassword(password)) { return done(null, false); }
        if (! (user.password === password) ) {
          //console.log("inside validator");
          return done(null, false, { message: 'Incorrect password.' });
        }
        //console.log("after validator");
        //console.log(done(null, user));
        return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  process.nextTick(function() {
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

passport.deserializeUser(function(user, done) {
  process.nextTick(function() {
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

function p(params) {
  console.log(params);
}

/* GET home page. */
router.get('/'  ,  function(req, res, next) {
  // if ( req.isAuthenticated){
  //   console.log("ahbjankan");
  // }
  try {
    if (!req.session.passport){
      res.redirect('/signin');
    }
  } catch (error) {
    res.redirect('/signin');
  }

  try {
    console.log(req.session);
  } catch (error) {
    
  }
  res.render('index', { title: 'Express' , message : req.flash('info') });
});





router.get( '/signin' , function(req , res){
  res.render('auth' , {title : "Sign In" , postSubmit : "signin"} );

});

router.post('/signin', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/signin' }) 
  );

router.get( "/createGroup" , function (req , res) {
  res.render('createGroup' , {message : req.flash('info') });
});

router.post( '/createGroup' , (req , res) =>{
  const name = req.body.groupName ;
  const description = req.body.description;
  const username = req.session.passport.user.username;

  p( username );
  
  Group.findOne( { name : name } , (err , grp)=> {

    if ( err ){ p(err);}
    if (grp) {
      // group object exixsts
      
      p( "group with this name already existes" );
      req.flash('info', 'group with this name already existes');
      res.redirect( '/createGroup' );


    } else {
      // group obj for this dosent exist
      
      var temp = new Group({
        name : name , 
        description : description ,
        admin : [ { username : username } ] ,
        users : [ { username : username} ]
      });
      temp.save().then(() => console.log('saved in db'));

      res.redirect( '/' + name );
      
    }


  });

});



router.get( "/register" , function(req , res){
  res.render('auth' , {title : "Register" , postSubmit : "register" } );
});

router.post( '/register' , (req , res)=> {

  const temp = new User({ username : req.body.username , password : req.body.password });
  temp.save().then(() => console.log('saved in db'));

  res.redirect('/signin');



});

router.post('/logout', function(req, res, next) {
  req.session.destroy(function(err) {
    if (err) { return next(err); }
    res.redirect('/signin');
  });
});

router.post('/joinGroup', async function(req, res) {

  const username = req.session.passport.user.username;
  const grpName = req.body.room;

  try {
    const grp = await Group.findOne({ name: grpName }).exec();

    if (grp) {
      // group object exists
      const userFound = grp.users.some(user => user.username === username);

      if (!userFound) {
        // user not found in group, add user
        await Group.updateOne({ name: grpName }, { $push: { users: { username : username } } }).exec();
        return res.redirect("/" + grpName);
      } else {
        //user already in group
        req.flash("info", "user is already in group");
        return res.redirect("/" + grpName);
      }
    } else {
      // group object doesn't exist
      req.flash('info', "group doesn't exist please create it first");
      return res.redirect('/createGroup');
    }

  } catch (error) {
    console.log(error);
    return res.status(500).send('Internal server error');
  }

});

router.get( "/groupList" ,  function (req , res) {
  
  Group.find( {} , "name description -_id" , function (err , result){
    if (err) { p(err); }
    if (result){
      p(result);
      res.render( "partials/groupList" , {groupList : result});
    }   
    else {
      return res.status(500).send('Internal server error');
    }
  });
  //return res.status(500).send('Internal server error');
});



router.get( "/:title"  , function (req , res ){
  try {
    if (!req.session.passport){
      res.redirect('/signin');
    }
  } catch (error) {
    res.redirect('/signin');
  }
  res.render("index" , { title : req.params.title , message :  req.flash('info') });
})

router.post('/'  , (req , res) => {
  console.log( req.body.roomName);
  res.redirect( "/" + req.body.roomName) ;
});



module.exports = router;
