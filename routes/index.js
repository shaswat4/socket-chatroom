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



mongoose.set( 'strictQuery' , true);
mongoose.connect('mongodb://127.0.0.1:27017/test');
const User = mongoose.model('user', { username : String , password : String  });


app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

passport.use( 'local' , new LocalStrategy(
  function(username, password, done) {
    console.log("aaaa");
    User.findOne({ username : username }, 
      function (err ,  user) {
        console.log( err , 'sknk' ,user);
        console.log(username , password);
        console.log(user.username , user.password);
        console.log('hello');
        if (err) {
          console.log("inside err");
          return done(err); }
        if (!user) { 
          console.log("inside !user");
          //console.log(done(null, false));

          return done(null, false); }
        //if (!user.verifyPassword(password)) { return done(null, false); }
        if (! (user.password === password) ) {
          console.log("inside validator");
          return done(null, false, { message: 'Incorrect password.' });
        }
        console.log("after validator");
        //console.log(done(null, user));
        return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});


function loggedIn(req, res, next) {
  if (req.user) {
      next();
  } else {
      res.redirect('/signin');
  }
}


/* GET home page. */
router.get('/', loggedIn , function(req, res, next) {
  res.render('index', { title: 'Express' });
});





router.get( '/signin' , function(req , res){
  res.render('auth' , {title : "Sign In" , postSubmit : "signin"} );

});

router.post('/signin', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/signin' }) 
  );







router.get( "/register" , function(req , res){
  res.render('auth' , {title : "Register" , postSubmit : "register" } );
} )

router.post( '/register' , (req , res)=> {

  const temp = new User({ username : req.body.username , password : req.body.password });
  temp.save().then(() => console.log('saved in db'));

  res.redirect('/signin');



});



router.get( "/:title" , loggedIn , function (req , res ){
  res.render("index" , { title : req.params.title });
})

router.post('/' , loggedIn , (req , res) => {
  console.log( req.body.roomName);
  res.redirect( "/" + req.body.roomName) ;
});



module.exports = router;
