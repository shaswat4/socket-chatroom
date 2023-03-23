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
const Chat_Group_message = db.Chat_Group_message ;

const passport = require("./passport");
const chat_group_message = require("../models/chat_group_message");

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

function getRandomNum() {
    return Math.floor((Math.random() * 10000000) + 1);
}

/* chat routes */

router.get('/' , (req , res) =>{
    let logged_user = req.session.passport.user;
    p(logged_user);
    res.render('chats' , { user : logged_user });
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

      const logged_user = req.session.passport.user;

      res.render('partials\\chatList' , {users : user , logged_user : logged_user} );
    //   res.redirect('/chat');

})

router.post('/getHeader' , async (req , res)=>{

    const username = req.session.passport.user.username;
    const abc = req.session.passport.user;
    p(abc);
    let id = req.body.user_id
    let user = await Users.findOne({
        where :{
            user_id : id 
        }
    })

    res.render( 'partials\\chatHeader' , {user : user });
})

router.post( '/creatGroup' , async (req, res)=> {

    const logged_user = req.session.passport.user;
    const user2 = req.body.user_id;

    let group_id = getRandomNum() ;


    //do: check if id alredy exists
    //if not present return [] empty set 
    // dont create if group alredy exists
    //maybe need another ajax call


    // await Chat_Group({
    //     Chat_Group_id : group_id,
    //     user_id : logged_user.id 
    // })

    // await Chat_Group({
    //     Chat_Group_id : group_id, 
    //     user_id : user2 
    // })

    res.send(group_id);

})

router.post('/getBody' , async (req , res)=>{

    let user_id = req.body.user_id ;
    const logged_user = req.session.passport.user;

    let query =
      `Select cg.chat_group_id
    from chat_groups cg , ChatGroupIsGroups cgig 
    where 
        cg.user_id=` +user_id +
      ` 
        and cg.chat_group_id in
        (select chat_group_id from chat_groups
            where user_id=` +
      logged_user.id +
      `
        )
        and cgig.isgroup=0 
        and cg.chat_group_id= cgig.chat_group_id;
    `

    const [results, metadata] = await sequelize.query(query);

    let chats = []

    if (results ===null || results===[] || results.length === 0 ){

        chats = []

    }
    else{

        let id = results[0].Chat_Group_id ;

        let query2 =
            `Select cgm.* , u.username
            from Chat_Group_messages cgm , Users u
            where 
            cgm.user_id = u.user_id ;`

        const [results2, metadata2] = await sequelize.query(query2);

        chats = results2;

    }

    res.render( 'partials\\chatBody' , {chats : chats , username : logged_user.username });

})

router.post( "/getMessage" , async (req , res)=>{
    

    let user_id = req.body.user_id ;
    const logged_user = req.session.passport.user;

    let user = await Users.findOne({
        attributes : ['user_id' , 'username'] , 
        where :{
            user_id : user_id 
        }
    })

    //res.render( 'partials\\chatHeader' , {user : user });

    let query =
      `Select cg.chat_group_id
    from chat_groups cg , ChatGroupIsGroups cgig 
    where 
        cg.user_id=` +user_id +
      ` 
        and cg.chat_group_id in
        (select chat_group_id from chat_groups
            where user_id=` +
      logged_user.id +
      `
        )
        and cgig.isgroup=0 
        and cg.chat_group_id= cgig.chat_group_id;
    `

    const [results, metadata] = await sequelize.query(query);

    let chats = []

    if (results ===null || results===[] || results.length === 0 ){

        chats = []

    }
    else{

        let id = results[0].Chat_Group_id ;

        let query2 =
            `Select cgm.* , u.username
            from Chat_Group_messages cgm , Users u
            where 
            cgm.user_id = u.user_id ;`

        const [results2, metadata2] = await sequelize.query(query2);

        chats = results2;

    }

    let object = {
        user : user,
        chats : chats , 
        logged_user : logged_user.username
    }

    p(object)

    res.send(object);

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


