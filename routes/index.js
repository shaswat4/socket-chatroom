var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get( "/:title" , function (req , res ){
  res.render("index" , { title : req.params.title });
})

module.exports = router;
