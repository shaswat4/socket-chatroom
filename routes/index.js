var express = require('express');
const app = express();
var router = express.Router();
const bodyParser = require("body-parser");

app.use(express.urlencoded({ extended: true }));


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


const mongoose = require('mongoose');
mongoose.set( 'strictQuery' , true);

mongoose.connect('mongodb://127.0.0.1:27017/test');

const User = mongoose.model('user', { email : String , password : String  });


router.get( '/signin' , function(req , res){
  res.render('auth' , {title : "Sign In" , postSubmit : "signin"} );

});

router.post('/signin', function (req, res) {
  const  email_ = req.body.email;
  const password_ = req.body.password;
  User.findOne({ email: email_ , password : password_ }, function (err, user) {
    if (err) {
      return res.status(500).json({ error: err });
    }
    if (!user) {
      return res.status(401).json({ error: 'User email or password is incorrect' });
    }
    else {
      res.status(200).json({ message: 'Login successful' });
    }
      
    });
  });







router.get( "/register" , function(req , res){
  res.render('auth' , {title : "Register" , postSubmit : "register" } );
} )

router.post( '/register' , (req , res)=> {

  const temp = new User({ email : req.body.email , password : req.body.password });
  temp.save().then(() => console.log('saved in db'));

  res.redirect('/signin');



});



router.get( "/:title" , function (req , res ){
  res.render("index" , { title : req.params.title });
})

router.post('/' , (req , res) => {
  console.log( req.body.roomName);
  res.redirect( "/" + req.body.roomName) ;
});



module.exports = router;
