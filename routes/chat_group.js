var express = require("express");
const app = express();
var router = express.Router();
const bodyParser = require("body-parser");
// var passport = require('passport');
var LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const { body, validationResult } = require('express-validator');

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
const { errorMonitor } = require("events");

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

async function getGroupAtrribute(group_id) {
  let grp = await Group_attribute.findOne({
    where: {
      Chat_Group_id: group_id,
    },
    raw: true,
  });
  return grp;
}

/*
* makes a new user admin based on following conditions :-
* if the number of admins in a group = 0
* then the oldest user in the group is made admin 
*/
async function setNewAdmin(group_id) {
  //finds number of admins for that group if 0 then proceeds
  let query = 
  `
    select Chat_Group_id , sum(admin) as no_of_admins
    from chat_groups cg
    group by Chat_Group_id
    having Chat_Group_id = ${group_id} ;
  `;

  const [results, metadata] = await sequelize.query(query);

  p(metadata)
  try {
    let no_of_admins = results[0].no_of_admins;

    p("a")
    p(no_of_admins)

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
  } catch (error) {
    p(error)
  }
  
}

/* main routes */

/**
 * gets group id
 * send list of users of the selected group
 * dosen't send the requesting user
 * sends 500 if error
 * or response json with Chat_Group_id , user_id , username
 */
router.post("/userList/get", [body("group_id").isNumeric()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    //let logged_user = req.session.passport.user ;
    let logged_user = req.body.user;
    let group_id = parseInt(req.body.group_id);

    p(req.body);
    console.log(logged_user, group_id);
    let errorList = [null, undefined, []];

    //checks type of input
    if (errorList.includes(typeof group_id) || group_id == "null") {
      throw new Error("expected parameter to be number");
    }
    //else checks if group exists
    else {
      let temp = await Group_attribute.findAll({
        where: {
          Chat_Group_id: group_id,
        },
      });

      if (errorList.includes(temp) || temp.length == 0) {
        throw new Error("No such group Exixts.");
      }
    }

    /**
     * gets chatGroupID ,  user id , username
     * by performing join on chat_groups , users
     * based on common user id
     * conditions : chat_group_id is same as user group_id
     *              check if logged in user is in group
     *              and dont show logged in user row
     */
    let query = `
    select Chat_Group_id , cg.user_id , username
    from chat_groups cg
    inner join users u on cg.user_id = u.user_id 
    where cg.Chat_Group_id = ${group_id} and 
      exists ( 
        select cg2.user_id from chat_groups cg2 
        where cg2.user_id = ${logged_user.id}
        ) 
      and cg.user_id != ${logged_user.id} ;`;

    const [results, metadata] = await sequelize.query(query);

    res.send({ userList: results });
  } catch (error) {
    p(error);
    res.sendStatus(500);
  }
});


/**
 * takes group name and description and user_id array
 * from request and
 * creates a group with the logged in user as admin
 * creates assciations in chat groups table
 * sends 500 if error occurs
 * else sends the created group id
 */
router.post("/create", [body("userList").isArray() ] ,  async (req, res) => {
  //need to get the formmatted data in req.body for userlist

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {

    let logged_user = {id : 1};
    //let logged_user = req.session.passport.user ;
  
    let group_name = req.body.group_name;
    let group_description = req.body.group_description;
    let userList = req.body.userList;
    userList.push(logged_user.id);
    userList = [...new Set(userList)];

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

      Chat_Group.create({
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


// takes (group_id group_name group_description)
// checks if group attribute with Chat_Group_id exixts
//  then if igGroup flag = true then 
// updates attributes
// is successfull then sends 200
// if fails then sends 400
// if error occur then send 500
router.post("/update", [body('group_id').isNumeric()], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let group_id = parseInt(req.body.group_id);
  let group_name = req.body.group_name;
  let group_description = req.body.group_description;

  try {
    let grp = await Group_attribute.findOne({
      where: {
        Chat_Group_id: group_id,
      },
      raw: true,
    });

    p(grp);

    if (!checkString(group_name) || !checkString(group_description)) {
      throw new Error("input name or description isn't string.");
    }
    if (grp == {} || grp == null) {
      throw new Error("group dosen't exist.");
    }

    if (grp.IsGroup == 1) {
      await Group_attribute.update(
        {
          name: group_name,
          description: group_description,
        },
        {
          where: {
            Chat_Group_id: group_id,
          },
        }
      );

      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  } catch (error) {
    p(error);
    res.sendStatus(500);
  }
});

/*
  tweek group create 
  tweek group exit
  make group delete
  make group add users
  make group delete a single user
  
  */
/**
 * takes grp id and logged user id 
 * if groip exists then checks 
 * if user is admin then sets new admin
 * then delets record
 * if successfull then sends 200
 * else sends 500
 */
router.post("/exit", [body("group_id").isNumeric()], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {

    let logged_user = req.body.user;
    let group_id = parseInt(req.body.group_id);

    let temp = await Chat_Group.findOne({
      where: {
        Chat_Group_id: group_id,
        user_id: logged_user.id,
      },
    });

    if ( temp== null || temp == undefined || temp == {} ){
      throw new Error("group dosent exist or user isnt in group");
    }

    await Chat_Group.destroy({
      where: {
        Chat_Group_id: group_id,
        user_id: logged_user.id,
      },
    });

    if (temp.admin === true) {
      setNewAdmin(temp.Chat_Group_id);
    }

    res.send(200);

  } catch (error) {
    p(error);
    res.sendStatus(500);
  }
});

/**
 * gets group id 
 * checks id user is admin and is_group flag is true then 
 * deletes group from group attributes and chat groups 
 * sends 200 if successfull 403 if condition fails 
 * and 500 if error occurs
 */
router.post("/delete", [body("group_id").isNumeric()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let logged_user = req.body.user;
  let group_id = parseInt(req.body.group_id);

  try {
    let checkAdmin = await Chat_Group.findOne({
      where: {
        Chat_Group_id: group_id,
        user_id: logged_user.id,
      },
    });

    let checkGroup = await Group_attribute.findOne({
      where: {
        Chat_Group_id: group_id,
      },
    });

    if (checkAdmin.admin === true && checkGroup.IsGroup === true) {
      Group_attribute.destroy({
        where: {
          Chat_Group_id: group_id,
        },
      });

      Chat_Group.destroy({
        where: {
          Chat_Group_id: group_id,
        },
      });

      return res.sendStatus(200);

    }
    else{
      return res.sendStatus(403);
    }

    
  } catch (error) {
    p(error);
    return res.sendStatus(500);
  }
});

/**
 * gets group_id
 * only if the user is in the group and group exits
 * sends list of users not added in the group
 */


/**
 * takes group_id 
 * cheacks if group exixts with that group_id
 * then sends a list of users whose associations 
 * aren't present in chat groups table 
 * sends json object
 * In error sends 500
 */
router.post("/user/add/getList", [body("group_id").isNumeric()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let logged_user = { id: 1 };
  let group_id = parseInt(req.body.group_id);

  try {
    // if( ! typeof group_id == 'number' ){
    //   throw new Error("group_id needs be a number");
    // }

    let grp = await getGroupAtrribute(group_id);

    if (grp === null || grp == undefined || grp == {}) {
      throw new Error("group dosen't exist.");
    }

    // checks if name exists
    // grp.name;

    p(grp);

    let query = 
    `
      SELECT u.user_id, u.username 
      FROM users u 
      LEFT JOIN chat_groups cg ON u.user_id = cg.user_id AND cg.chat_group_id = ${group_id} 
      WHERE cg.user_id IS NULL;
    `

    const [results, metadata] = await sequelize.query(query);

    p(results);
    p(metadata);
    res.send({ users: results });

  } catch (error) {
    p(error);
    res.sendStatus(500);
  }
  
});

/**
 * takes group_id , user_list : array(int)
 * userList can contain already added users
 * created associated recored in chat Groups
 * (anyone can add to group)
 * if successfull sends 200
 * else sends 500
 */
router.post("/user/add/endpoint", [body('group_id').isNumeric() , body("userList").isArray()] ,  async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let logged_user = req.body.user;
  let group_id = parseInt(req.body.group_id);
  let userList = req.body.userList;

  userList.push(logged_user.id);
  userList = [...new Set(userList)];

  let temp = await Chat_Group.findAll({
    attributes :  ["user_id"], 
    where:{
      Chat_Group_id : group_id
    }
  });

  var diff = userList.filter( ele => {
    return temp.findIndex((y) => {
      return y.user_id === ele ;
    }) < 0;
  });

  const tempList = diff.map((user_id) => {
    return {
      Chat_Group_id: group_id,
      user_id,
      admin: false,
    };
  });

  Chat_Group.bulkCreate(tempList)
    .then(() => {
      console.log("Bulk insert successful");
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error("Error during bulk insert:", err);
      res.sendStatus(500);
    });
});

/**
 * takes group_id and user_id to remove
 * checks if logged in user is admin
 * then removes the associated record
 * sends 200
 * if user isn't admin sends 403
 * on errors sends 500
 */
router.post("/user/remove", [body('group_id').isNumeric(), body('user_id').isNumeric()], async (req, res) => {
  //only admins can remove

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let logged_user = req.body.passport.user;
  let group_id = parseInt(req.body.group_id);
  let user_id = parseInt(req.body.user_id);

  try {
    let logged_user_obj = await Chat_Group.findOne({
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
  } catch (error) {
    p(error);
    res.sendStatus(500);
  }
  
});

/**
 * takes group_id , user_id 
 * checks if logged in user is admin
 * then updates user_id sent via api
 * sends 200
 * if logged in user isn't admin then sends 403
 * if error occurs sends 500
 */
router.post("/setAdmin", [body('group_id').isNumeric(), body('user_id').isNumeric()], async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let logged_user = req.body.user;
  let group_id = parseInt(req.body.group_id);
  let user_id = parseInt(req.body.user_id);

  try {
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
  } catch (error) {
    p(error);
    res.sendStatus(500);
  }
});

module.exports = router;