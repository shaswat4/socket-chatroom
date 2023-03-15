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
const { ObjectID } = require('bson');
const { isDataView } = require('util/types');
app.use(flash());

mongoose.set( 'strictQuery' , true);
mongoose.connect('mongodb://127.0.0.1:27017/test');
const User = require('../models/user');
const Group = require('../models/group')

const Chat = require('../models/chat');


const { Sequelize, Op, Model, DataTypes } = require("sequelize");


const sequelize = new Sequelize('webapp', 'root', 'aaaa', {
  host: 'localhost',
  dialect: 'mysql'
});


class Users extends Model {}

Users.init({
  // Model attributes are defined here
  user_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  username: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(20),
    allowNull : false
  }
}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'User', // We need to choose the model name
  timestamps : false
});

class Groups extends Model {}

Groups.init({
  // Model attributes are defined here
  group_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
    //allowNull : false
  },

  name: {
    type: DataTypes.STRING(40),
    allowNull : false
  },

  description: {
    type: DataTypes.STRING(500), 
    defaultValue : ''
  }
}, 
{

  sequelize, 
  modelName: 'Group', 
  timestamps : false
});


class Group_User extends Model {}

Group_User.init({

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
    },

  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  group_id : {
    type: DataTypes.INTEGER,
    allowNull : false , 
    references :{
      model : Groups , 
      key : 'group_id'
    }
  }, 

  user_id : {
    type: DataTypes.INTEGER,
    allowNull : false , 
    references :{
      model : Users , 
      key : 'user_id'
    }
  },

  username: {
    type: DataTypes.STRING(20),
  },
  
},{
  sequelize , 
  modelName : 'Group_User',
});

class Chats extends Model {}

Chats.init({
  // grp (name , id ) , sent at(time)
  //
  chat_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
    },

  message: {
    type: DataTypes.STRING(5000),
    allowNull : false
  },

  Group_User_id: {
    type: DataTypes.INTEGER,
    allowNull : false , 
    references :{
      model : Group_User , 
      key : 'id'
    }
  },

  username: {
    type: DataTypes.STRING(20)
  },

  user_id: {
    type: DataTypes.INTEGER
  },

  group_id: {
    type: DataTypes.INTEGER
  },

  groupName :{
    type : DataTypes.STRING
  } , 
    
  SentAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

},{
  sequelize , 
  modelName : 'Chat',
});

// Groups.belongsToMany(User, { through: Group_User });
// Users.belongsToMany(Group, { through: Group_User });



(async () => {
  await sequelize.sync({ alter: true });
  // Users.sync();
  // Groups.sync();
  // Group_User.sync();
  // Chats.sync();

  //await Groups.belongsToMany(Users , { through : Group_User , onDelete: 'cascade' } );
  //await Users.belongsToMany(Groups , {through : Group_User  ,onDelete: 'cascade'  })
})();




console.log(Chats)

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

passport.use( 'local' , new LocalStrategy(
  async function(username, password, done) {
    Users.findOne({
      where : { 
        username : username ,  
        password : password
      }
    }).then( user => {
      
      if (!user) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
      // if (user.password !== password) {
      //   return done(null, false, { message: 'Incorrect password.' });
      // }
      return done(null, user);

    }).catch(err => done(err));

  }
));

passport.serializeUser(function (user, done) {
  process.nextTick(function () {
    done(null, { id: user.user_id, username: user.username });
  });
});

/*
passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
*/

passport.deserializeUser(function (user, done) {
  process.nextTick(function () {
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

/* Auth routes */

router.get("/signin", function (req, res) {
  res.render("auth", { title: "Sign In", postSubmit: "signin" , message : req.flash("info") });
});

router.post("/signin",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/signin",
  })
);

router.get("/register", function (req, res) {
  res.render("auth", { title: "Register", postSubmit: "register" , message : req.flash("info") });
});

router.post("/register", async (req, res) => {

  let temp = await Users.findOne({where:{
    username : req.body.username
  }});

  if (temp){
    req.flash("info", "This username already exists");
    return res.redirect('/register');
  }

  await Users.create({ 
    username: req.body.username,
    password: req.body.password
  }).then(() => console.log("saved in db"));

  res.redirect("/signin");
});

router.post("/logout", function (req, res, next) {
  req.session.destroy(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/signin");
  });
});

/* Other routes */

router.get("/createGroup", isSignedIn, function (req, res) {
  res.render("createGroup", { message: req.flash("info") });
});

router.post("/createGroup", isSignedIn, async (req, res) => {
  const name = req.body.groupName;
  const description = req.body.description;
  const username = req.session.passport.user.username;

  p(username);

  try {
    if (name === null || name === undefined || name === "") {
      throw "name not defined";
    }

    let grp = await Groups.findOne({
      where : {
        name : name
      }
    });

    if (grp) {
      // group object exixsts

      p("group with this name already existes");
      req.flash("info", "group with this name already existes");
      res.redirect("/createGroup");

    } else {

      let new_grp =  await Groups.create({ 
        name : name,
        description :description
      });

      let temp_user = await Users.findOne({
        where : { username : username}
      });

      await Group_User.create({
        isAdmin : true , 
        group_id : new_grp.group_id,
        user_id : temp_user.user_id , 
        username : username

      });

      res.redirect('/group/'+ new_grp.group_id);
    }

  } catch (error) {
    p(error);
    res.redirect("/");
  }


});

router.get('/abc' , async (req , res)=>{

  let t = await Users.findAll({
    //attributes : ['']
    where : {
      user_id : 6
    }
  });
  
  //p(t[0].username)
  //p(t[0])
  p(t)

  
  p(typeof(t[0]))
  
  // t.forEach( ele =>{
  //   ele = JSON.parse(JSON.stringify(ele))
  //   ele.joined = false ;
  // })

  let query = 'SELECT * ,' + 
  'CASE ' +
  'WHEN user_id in ' +
  '(select gu.user_id from group_users gu where group_id = 1 ) '+
  'THEN 1 '+
  'ELSE 0 '+
  'END AS joined '+
  'FROM `users`; '

  const [results, metadata] = await sequelize.query(
    query
  );


  let grps = await Groups.findAll({});


  
  //res.send(req.session.passport);
  res.send( results )

})


router.get("/", isSignedIn, async function (req, res, next) {
  
  let home_id =  1 ;

  try {
    

    let obj = await Groups.findOne({ where : {group_id : home_id}});
    let chat = await Chats.findAll({ where : { group_id :home_id } });

    if (!obj){
      //not found
      req.flash("info","group dosent exist at this url");
      res.render('404' , {message : req.flash('info')})
    } 
    else {
      let t = req.session.passport.user;
      res.render("index", { 
        id : obj.group_id ,  
        title: obj.name, 
        message: req.flash("info") ,
        user_id : t.id , 
        username : t.username , 
        chats : chat 
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
  
  //res.render("index", { title: "Home", message: req.flash("info") });
});




router.post("/joinGroup", isSignedIn, async function (req, res) {
  const username = req.session.passport.user.username;
  const grpName = req.body.room;

  

  try {

    //finds group and user object
    const grp = await Groups.findOne({
       where : { name : grpName }
    });
    
    p(grp)

    const usr = await Users.findOne({
      where :{
        username : username
      }
    });

    p(usr)
    
    if (grp) {
      // group object exists
      
      let userFound = await Group_User.findAll({
        where :{
          group_id : grp.group_id , 
          user_id : usr.user_id
        }
      });

      if (userFound !== []) {
        // user not found in group, add user
        
        let new_grp = await Group_User.create({
          group_id : grp.group_id , 
          user_id : usr.user_id 
        })

        return res.redirect("/group/" + new_grp.group_id );
      } 
      else {
        //user already in group
        req.flash("info", "user is already in group");
        return res.redirect("/group/" + new_grp.group_id );
      }
    } else {
      // group object doesn't exist
      req.flash("info", "group doesn't exist please create it first");
      return res.redirect("/createGroup");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

router.get("/groupList", isSignedIn, async function (req, res) {
  let grps = await Groups.findAll({});

  if (grps) {
    //p( grps );
    res.render("groupList", { groupList: grps, message: req.flash("info") });
  } else {
    return res.status(500).send("Internal server error");
  }
});

router.get("/editGroup/:id", isSignedIn, async function (req, res) {
  let id = req.params.id;

  try {
    const grp = await Groups.findOne({
      where: {
        group_id: id,
      },
    });

    if (grp) {
      // group object exists => updates
      p(grp);
      res.render("editGroup", { message: req.flash("info"), group: grp });
    } else {
      // group object doesn't exist
      req.flash(
        "info",
        "group doesn't exist please create it first before editing"
      );
      return res.redirect("/createGroup");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

router.post("/editGroup/:id", isSignedIn, async function (req, res) {
  let id = req.params.id;

  try {
    //if group name empty => reload
    if (req.body.groupName == "") {
      req.flash("info", "You cannot leave the group name empty!");
      return res.redirect("/editGroup/" + id);
    }

    const grp = await Groups.update(
      {
        name: req.body.groupName,
        description: req.body.description,
      },
      {
        where: {
          group_id: id,
        },
      }
    );

    if (grp) {
      // group object exists => redirects to group page

      res.redirect("/group/" + id);
    } else {
      // group object doesn't exist
      req.flash(
        "info",
        "group doesn't exist please create it first before editing"
      );
      return res.redirect("/createGroup");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

router.post("/deleteGroup/:id", isSignedIn, async function (req, res) {
  let id = req.params.id;

  try {
    const temp = await Group_User.destroy({
      where: {
        group_id: id,
      },
    });

    const grp = await Groups.destroy({
      where: {
        group_id: id,
      },
    });

    p(grp);

    if (grp) {
      //groups obj exists

      return res.redirect("/groupList");
    } else {
      //group object dosent exist
      req.flash(
        "info",
        "group dosen't exist, please check name before deleating"
      );
      return res.redirect("/groupList");
    }
  } catch (error) {
    p(error);
    return res.status(500).send("Internal server error");
  }

  res.redirect("/groupList");
});

router.get("/group/:id", isSignedIn, async function (req, res) {
  let id = req.params.id;

  try {
    let obj = await Groups.findOne({
      where: {
        group_id: id,
      },
    });

    let chat = await Chats.findAll({
      where: {
        group_id: id,
      },
    });

    if (!obj) {
      //not found
      req.flash("info", "group dosent exist at this url");
      res.render("404", { message: req.flash("info") });
    } else {
      let t = req.session.passport.user;
      res.render("index", {
        id: obj.group_id,
        title: obj.name,
        message: req.flash("info"),
        user_id: t.id,
        username: t.username,
        chats: chat,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/userList", isSignedIn, async (req, res) => {
  let users = await Users.findAll({});

  res.render("userList", { users: users });
});

router.get("/group/addUser/:id", isSignedIn, async (req, res) => {
  let id = req.params.id;

  //time complexity n*m

  let grp = await Groups.findOne({ where: { group_id: id } });

  let query =
    "SELECT * , CASE WHEN user_id in " +
    "(select gu.user_id from group_users gu where group_id = " +
    grp.group_id +
    " ) THEN 1 ELSE 0 END AS joined FROM `users`; ";

  const [results, metadata] = await sequelize.query(query);

  res.render("editGroupUser", { userList: results, group: grp });
});

router.post("/group/addUser/:id", isSignedIn, async (req, res) => {
  let grpId = req.params.id;
  p(grpId);
  let userList = Object.keys(req.body);
  p(userList);

  try {
    let selected_users = await Users.findAll({
      attributes: ["user_id", "username"],
      where: {
        username: {
          [Op.in]: userList,
        },
      },
    });

    // selected_users.forEach((ele) => {
    //   p(ele.user_id);
    // });

    for (let index = 0; index < selected_users.length; index++) {
      const ele = selected_users[index];

      await Group_User.findOrCreate({
        where: {
          group_id: grpId,
          user_id: ele.user_id,
        },
        defaults: {
          isAdmin: false,
          username: ele.username,
        },
      });
    }
  } catch (error) {
    p(error);
  }

  res.redirect("/group/" + grpId);
});

router.get("/group/removeUser/:id", isSignedIn, async (req, res) => {
  let id = req.params.id;

  let grp = await Groups.findOne({
    where: {
      group_id: id,
    },
  });

  let query =
    `select user_id , username  from users where user_id in 
  (select user_id from group_users where group_id = ` +
    grp.group_id +
    ` );`;

  const [results, metadata] = await sequelize.query(query);

  res.render("removeGroupUser", { userList: results, group: grp });
});

router.post("/group/removeUser/:id", isSignedIn, async (req, res) => {
  let grpId = req.params.id;
  p(grpId);
  let userList = Object.keys(req.body);
  p(userList);

  try {
    let grp = await Groups.findOne({
      where: {
        group_id: grpId,
      },
    });

    let usr = await Users.findAll({
      attributes: ["user_id"],
      where: {
        username: {
          [Op.in]: userList,
        },
      },
    });

    let userIds = usr.map((user) => user.user_id);

    await Group_User.destroy({
      where: {
        group_id: grp.group_id,
        user_id: {
          [Op.in]: userIds,
        },
      },
    });

    req.flash("info", "users removed from group");
  } catch (error) {
    p(error);
  }

  res.redirect("/group/" + grpId);
});



router.post("/", isSignedIn, (req, res) => {
  console.log(req.body.roomName);
  res.redirect("/group/" + req.body.roomName);
});

module.exports = router;
