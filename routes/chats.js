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
const ChatGroupIsGroup = db.ChatGroupIsGroup;
const Group_attribute = db.Group_attribute ;

const passport = require("./passport");
const chat_group_message = require("../models/chat_group_message");
const { group } = require("console");
const { response } = require("express");
const { Template } = require("ejs");

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

router.get('/abc' , async (req , res)=>{
  let t = await Chat_Group.findOne({
    //attributes : ['admin'] , 
    where:{
      Chat_Group_id : 1 
    }
  })

  p( t)

  // setNewAdmin(3);
  res.send(200)
})

// searches users and group Names and sends json
router.post("/search", async (req, res) => {

  /* gets query in string 
  *  sends json list back of matching usernames 
  *  and groups names 
  */

  let query = req.body.query;
  const username = req.session.passport.user.username;

  let user = await Users.findAll({
    attributes : [ "user_id" , ["username" , "name"]], 
    where: {
      username: {
        [Op.and]: {
          [Op.like]: query + "%",
          [Op.ne]: username,
        },
      },
    },
  });

  let groups = await Group_attribute.findAll({
    attributes : [["Chat_Group_id" , "group_id"], "name" , "description"], 
    where:{
      IsGroup: true , 
      name : {
        [Op.like] : query + "%" ,
      }
    }
  })

  p(user);
  p(groups)

  const logged_user = req.session.passport.user;

  res.send({ logged_user : logged_user  , users : user , groups : groups })

  // res.render("partials\\chatList", { users: user, logged_user: logged_user });
});

// gets user_id if 1-1 chat dosn't exist then creates and sends id
router.post("/getGroupID", async (req, res) => {
  let user_id = req.body.user_id;
  const logged_user = req.session.passport.user;

  p(logged_user.id);

  /*
  searches all group attributes and joins then with 
  chat groups where chat group id match
  and isGroup flag is false and 
  user_id is = requsted userid 
  and there exists a record with same chat group id 
  and user id = logged user_id
  */
  let query = 
    `SELECT ga.*, cg.user_id
    FROM group_attributes ga
    INNER JOIN chat_groups cg ON cg.Chat_Group_id = ga.Chat_Group_id
    WHERE IsGroup = false 
      AND cg.user_id =${user_id}
      AND EXISTS (
        SELECT 1
        FROM chat_groups cg2
        WHERE cg2.Chat_Group_id = ga.Chat_Group_id
          AND cg2.user_id = ${logged_user.id}
      );
    `

  const [results, metadata] = await sequelize.query(query);

  let group_id = null;

  try {
    //if grp id not found
    if (results === null || results === [] || results.length === 0) {

      let grp = await Group_attribute.create({
        IsGroup : false, 
        name : null , 
        description: null 
      })

      group_id = grp.Chat_Group_id;

      const tempList = [logged_user.id, user_id].map((id) => ({
        Chat_Group_id: grp.Chat_Group_id,
        user_id: id,
        admin: false,
      }));      

      await Chat_Group.bulkCreate(tempList);

    } else {
      //grp id found
      group_id = results[0].chat_group_id;
    }
  } catch (error) {
    p(error);
  }

  // p(results);
  // p(group_id);

  let object = {
    group_id: group_id,
  };

  res.send(object);
});

router.post( "/getMessage" , async (req , res)=>{
    

    let user_id = req.body.user_id ;
    const logged_user = req.session.passport.user;

    let user = await Users.findOne({
        attributes : ['user_id' , 'username'] , 
        where :{
            user_id : user_id 
        }
    })

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
    p(results)

    let chats = []

    if (results ===null || results===[] || results.length === 0 ){

        chats = []

    }
    else{

        let id = results[0].chat_group_id ;
        // p('\n\n\n\n')
        // p(results)
        // p('\n\n\n\n')
        // p(results[0])
        // p('\n\n\n\n')
        // p(results[0].Chat_Group_id ) 
        // p(id)

        let query2 =
            `Select cgm.* , u.username
            from Chat_Group_messages cgm , Users u
            where 
            cgm.user_id = u.user_id 
            and chat_group_id = `+
            id
            +`;`

        const [results2, metadata2] = await sequelize.query(query2);

        p(results);

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

//not used
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

//sends active chat list including users and groups
router.post("/activeChatList" , isSignedIn , async ( req , res)=> {
  

  try {
    let logged_user = req.session.passport.user ;

    //let logged_user = {username : "a" , id: 1};

    // let logged_user = req.body ;
    // p(logged_user );

    // let query = 
    // `select 
    //   distinct cg.chat_group_id , cg.user_id , u.username 
    //   from chat_groups cg  
    // inner join users u on u.user_id = cg.user_id 
    // inner join chat_group_messages  cgm  on 
    //   cg.chat_group_id = cgm.chat_group_id and 
    //   cg.chat_group_id in 
    //     (select chat_group_id from chat_groups where user_id = 1 )
    // where cg.user_id != 1 ;
    // `


    // selects user groups from group attributes joins them with 
    // chat groups and associated users 
    // filters them with user_id other than requesting user 
    // and checks if user exists in the group
    // and where at least 1 message of that group exists
    // union 
    // selects groups with isgroup flag true
    //and includes the requesting user 
    // then sorts this union in desending order based on updated at timestamp
    let query = 
    `select *  from (
      select 
      ca.chat_group_id , ca.isgroup , 
      u.user_id ,  u.username , 
      name group_name , description as  group_description , 
      ca.updatedat
      from group_attributes ca
      inner join chat_groups cg on ca.chat_group_id = cg.chat_group_id
      inner join users u on cg.user_id = u.user_id  
      where 
      exists ( select user_id from chat_group_messages cgm where  cgm.chat_group_id = ca.chat_group_id )
      and isgroup =  false and u.user_id != ${logged_user.id} 
      and ${logged_user.id} in (
        select  cg2.user_id  from chat_groups cg2 
        where cg.Chat_Group_id = cg2.Chat_Group_id
            )
    
    union 
    
    select 
       ca.chat_group_id , ca.isgroup , 
        null as user_id , null as username , 
        ca.name as group_name , ca.description as group_description , 
        ca.updatedat 
        from group_attributes ca
        inner join chat_groups cg on cg.chat_group_id = ca.chat_group_id and cg.user_id = ${logged_user.id}
        where isgroup = true 
        ) as temp 
        order by updatedat desc ;`

    const [results, metadata] = await sequelize.query(query);
        
    res.send({chatList : results})

  } catch (error) {
    p( error)
  }

});

module.exports = router;
