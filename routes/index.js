var express = require('express');
const app = express();
var router = express.Router();
const bodyParser = require("body-parser");

app.use(express.urlencoded({ extended: true }));


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get( "/:title" , function (req , res ){
  res.render("index" , { title : req.params.title });
})

router.post('/' , (req , res) => {
  console.log( req.body.roomName);
  res.redirect( "/" + req.body.roomName) ;
});


module.exports = router;
