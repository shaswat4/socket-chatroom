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
  res.render('index', { title: 'Express' });
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
} )

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

router.post( "/" )

router.post( '/joinGroup' , function ( req , res ) {

  console.log( req.session.passport.user.username );
  const username = req.session.passport.user.username;

  Group.findOne( { room : req.body.room } , (err , grp)=> {

    if ( err ){ console.log(err);}
    if (grp) {
      // group object exixsts
      

    } else {
      // group obj for this dosent exist
      
      var temp = new Group;
      //temp

    }

  });

   //const temp = new Group;
   //temp.room = req.body.room ;
   //temp.
   //temp.save().then(() => console.log('saved in db'));



});


router.get( "/:title"  , function (req , res ){
  try {
    if (!req.session.passport){
      res.redirect('/signin');
    }
  } catch (error) {
    res.redirect('/signin');
  }
  res.render("index" , { title : req.params.title });
})

router.post('/'  , (req , res) => {
  console.log( req.body.roomName);
  res.redirect( "/" + req.body.roomName) ;
});



module.exports = router;
