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
const Chat_Group_message = db.Chat_Group_message;
const ChatGroupIsGroup = db.ChatGroupIsGroup;
const Group_attribute = db.Group_attribute;

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
  return Math.floor(Math.random() * 10000000 + 1);
}

function checkString( str ){
  return (typeof str === 'string' || str instanceof String);
}


/*
* makes a new user admin based on following conditions :-
* if the number of admins in a group = 0
* then the oldest user in the group is made admin 
*/
async function setNewAdmin(group_id) {
  //finds number of admins for that group if 0 then proceeds
  let query = `select Chat_Group_id , sum(admin) as no_of_admins
  from chat_groups cg
  group by Chat_Group_id
  having Chat_Group_id = ${group_id} ;`;

  const [results, metadata] = await sequelize.query(query);

  p(metadata)
  let no_of_admins = results[0].no_of_admins;

  if (no_of_admins == 0) {
    // update the oldest created user to admin if
    // no of admin is zero

    await Chat_Group.update(
      { admin: true },
      {
        where: {
          Chat_Group_id: group_id,
        },
        order: [["createdAt", "ASC"]],
        limit: 1,
      }
    );
  }

  p(results);
}

/* main routes */

//gets group id
// send list of users of the selected group
// dosen't send the requesting user
//sends 500 if error 
// or response json with Chat_Group_id , user_id , username
router.post("/userList/get", async (req, res) => {
  try {
    //let logged_user = req.session.passport.user ;
    let logged_user = req.body.user;
    let group_id = req.body.group_id;

    p(req.body)
    console.log( logged_user , group_id)
    let errorList = [null , undefined , [] ]


    //checks type of input
    if (  errorList.includes( typeof(group_id) ) || group_id == "null" ){
      throw new Error("expected parameter to be number")
    }
    //else checks if group exists
    else{
      let temp = await Group_attribute.findAll({
        where:{
          Chat_Group_id : group_id
        }
      })

      if ( errorList.includes(temp) || temp.length == 0){
        throw new Error("No such group Exixts.")
      }
    }

    //gets chatGroupID ,  user id , username 
    // by performing join on chat_groups , users
    // based on common user id
    //conditions : chat_group_id is same as user group_id
    //            check if logged in user is in group
    //            and dont show logged in user row
    let query =
      `
      select Chat_Group_id , cg.user_id , username
      from chat_groups cg
      inner join users u on cg.user_id = u.user_id 
      where cg.Chat_Group_id = ${group_id } and 
        exists ( 
          select cg2.user_id from chat_groups cg2 
          where cg2.user_id = ${logged_user.id}
          ) 
        and cg.user_id != ${logged_user.id} ;`

    const [results, metadata] = await sequelize.query(query);

    res.send({ userList: results });

  } catch (error) {
    p(error)
    res.sendStatus(500)
  }
});

//takes group name and description from request and 
// creates a group with the logged in user as admin 
// creates assciations in chat groups table
// sends 500 if error occurs
// else sends the created group id 
router.post("/create", async (req, res) => {
  //need to get the formmatted data in req.body for userlist

  let logged_user = {id : 1};
  //let logged_user = req.session.passport.user ;

  let group_name = req.body.group_name;
  let group_description = req.body.group_description;
  let userList = req.body.userList;
  userList.push(logged_user.id);
  userList = [...new Set(userList)];

  try {

    //validates input
    if ( !checkString(group_name) || !checkString(group_description) ){
      throw new Error("input name or description isn't string.")
    }

    //creates group
    let grp = await Group_attribute.create({
      // Chat_Group_id: id,
      IsGroup: true,
      name: group_name,
      description: group_description,
    });

    // defines group-user associations
    // sets logged in user as admin 
    let adminFlag = false ;
    for (let index = 0; index < userList.length; index++) {
      const element = userList[index];

      if ( element === logged_user.id  ){
        adminFlag = true;
      }

      await Chat_Group.create({
        Chat_Group_id: grp.Chat_Group_id,
        user_id: element,
        admin : adminFlag
      });

      adminFlag = false;
    }

    res.send({group_id : grp.Chat_Group_id });
  } catch (error) {
    p(error);
    res.sendStatus(500);
  }
});

router.post("/update", async (req, res) => {
  let group_id = req.body.group_id;
  let group_name = req.body.group_name;
  let group_description = req.body.group_description;

  try {
    let grp = await Group_attribute.findOne({
      where: {
        Chat_Group_id: group_id,
      },
    });

    if (grp.IsGroup === true) {
      await Group_attribute.update({
        Chat_Group_id: id,
        IsGroup: true,
        name: group_name,
        description: group_description,
      });

      res.send(200);
    } else {
      res.send(400);
    }
  } catch (error) {
    p(error);
    res.send(500);
  }
});

/*
  tweek group create 
  tweek group exit
  make group delete
  make group add users
  make group delete a single user
  
  */

router.post("/exit", async (req, res) => {
  let logged_user = { id: 1 };
  let group_id = req.body.group_id;

  let temp = Chat_Group.findOne({
    where: {
      Chat_Group_id: group_id,
      user_id: logged_user.id,
    },
  });

  if (temp.admin === true) {
    setNewAdmin(temp.Chat_Group_id);
  }

  Chat_Group.destroy({
    where: {
      Chat_Group_id: group_id,
      user_id: logged_user.id,
    },
  });

  res.send(200);
});

router.post("/delete", async (req, res) => {
  let logged_user = { id: 1 };
  let group_id = req.body.group_id;

  let checkAdmin = Chat_Group.findOne({
    where: {
      Chat_Group_id: group_id,
      user_id: logged_user.id,
    },
  });

  let checkGroup = Group_attribute.findOne({
    where: {
      Chat_Group_id: group_id,
    },
  });

  if (checkAdmin.admin === true && checkGroup.IsGroup === true) {
    await Group_attribute.destroy({
      where: {
        Chat_Group_id: group_id,
      },
    });

    await Chat_Group.destroy({
      where: {
        Chat_Group_id: group_id,
      },
    });
  }

  res.send(200);
});

router.post("/user/add/getList", async (req, res) => {
  /*
    sends users not added to the group
    */

  let logged_user = { id: 1 };
  let group_id = req.body.group_id;
  //let userList = [1 , 2 ,3]

  // userList.push(logged_user.id);
  // userList = [...new Set(userList)];

  let query = `
        SELECT u.user_id, u.username 
        FROM users u 
        LEFT JOIN chat_groups cg ON u.user_id = cg.user_id AND cg.chat_group_id = ${group_id} 
        WHERE cg.user_id IS NULL;
        `;

  const [results, metadata] = await sequelize.query(query);

  p(results);
  p(metadata);
  res.send({ users: results });
});

router.post("group/user/add", async (req, res) => {
  let logged_user = { id: 1 };
  let group_id = req.body.group_id;
  let userList = [1, 2, 3];

  userList.push(logged_user.id);
  userList = [...new Set(userList)];

  const tempList = userList.map((user_id) => {
    return {
      Chat_Group_id: group_id,
      user_id,
      admin: false,
    };
  });

  Chat_Group.bulkCreate(tempList)
    .then(() => {
      console.log("Bulk insert successful");
      res.send(200);
    })
    .catch((err) => {
      console.error("Error during bulk insert:", err);
      res.send(400);
    });
});

router.post("/user/remove", async (req, res) => {
  //only admins can remove

  let logged_user = { id: 1 };
  let group_id = req.body.group_id;
  let user_id = req.body.user_id;

  let logged_user_obj = Chat_Group.findOne({
    where: {
      user_id: logged_user.id,
      Chat_Group_id: group_id,
    },
  });

  if (logged_user_obj.admin === true) {
    Chat_Group.destroy({
      where: {
        user_id: user_id,
        Chat_Group_id: group_id,
      },
    });

    res.sendStatus(200);
  } else {
    res.sendStatus(403);
  }
});

router.post("/setAdmin", async (req, res) => {
  let logged_user = { id: 1 };
  let group_id = req.body.group_id;
  let user_id = req.body.user_id;

  let logged_user_obj = await Chat_Group.findOne({
    where: {
      Chat_Group_id: group_id,
      user_id: logged_user.id,
    },
  });

  if (logged_user_obj.admin == true) {
    await Chat_Group.update(
      {
        admin: true,
      },
      {
        where: {
          Chat_Group_id: group_id,
          user_id: user_id,
        },
      }
    );

    res.sendStatus(200);
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;