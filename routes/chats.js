var express = require("express");
const app = express();
var router = express.Router();
const bodyParser = require("body-parser");
// var passport = require('passport');
var LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

process.env.DEBUG = "passport:*";

app.use(bodyParser.urlencoded({ extended: true }));

var flash = require("connect-flash");
const { ObjectID } = require("bson");
const { isDataView } = require("util/types");
app.use(flash());

const { Sequelize, Op, Model, DataTypes } = require("sequelize");

const db = require("../models");

const sequelize = db.sequelize;

const Users = db.Users;
const Groups = db.Groups;
const Group_User = db.Group_User;
const Chats = db.Chats;
const Chat_Group = db.Chat_Group;

const passport = require("./passport");

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

/* chat routes */

router.get('/' , (req , res) =>{
    res.render('chats' , {});
})

router.get('/abc' , (req , res)=>{

    res.send('olleh');
})

router.post('/search'  , async (req , res) =>{

    let query = req.body.query;
    const username = req.session.passport.user.username;

    //let a = req.query ;
    //p( a)
    //p(query)
    // p( a)

    let user = await  Users.findAll({
        where :{
            username : {
                [Op.and]:{
                    [Op.like] : query + '%' , 
                    [Op.ne] : username, 
                }

            }
        }
      });

      p( user);

      res.render('partials\\chatList' , {users : user} );
    //   res.redirect('/chat');

})

router.post('/getHeader' , async (req , res)=>{
    let id = req.body.user_id
    let user = await Users.findOne({
        where :{
            user_id : id 
        }
    })

    res.render( 'partials\\chatHeader' , {user : user });
})

router.post('/getBody' , async (req , res)=>{

})


router.post('/connect' , isSignedIn , async (req , res)=> {
    
    const username = req.session.passport.user.username;

    p(username);

    try {


        let a  = req.body.users;
        let userList = JSON.parse(a) ;

        let user = await  Users.findOne({
            where :{
                username : username ,
            }
          });

        p(user)
        p(user.username)

        userList.push( user.user_id );
        p(userList);

        let temp = "(";
        
        for (let index = 0; index < userList.length; index++) {
            if ( index > 0 ){
                temp += ',';
            }

            const element = userList[index];
            
            temp += element.toString();
        }

        temp += ')' ;

        p(temp);


        let query = `SELECT group_id
            FROM chat_groups
            GROUP BY group_id
            HAVING COUNT(DISTINCT user_id) = `+  userList.length +
            `AND 
            COUNT(DISTINCT CASE WHEN user_id NOT IN 
                ` + temp +  ` THEN user_id END) = 0;`

        


        p(a)
        p( typeof(a));
    
        res.send(a); 

    } catch (error) {

        p(error)
        
    }

    
   
});

//router.get()



module.exports = router;


