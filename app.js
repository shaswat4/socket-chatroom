var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var flash = require('connect-flash');
app.use(flash());

const mongoose = require('mongoose');
mongoose.set( 'strictQuery' , true);
mongoose.connect('mongodb://127.0.0.1:27017/test');

var store = new MongoDBStore({
  uri: 'mongodb://127.0.0.1:27017/test',
  collection: 'mySessions'
});

// Catch errors
store.on('error', function(error) {
  console.log(error);
});


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

  // Group_User_id: {
  //   type: DataTypes.INTEGER,
  //   allowNull : false , 
  //   references :{
  //     model : Group_User , 
  //     key : 'id'
  //   }
  // },

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






app.use(session(
  { secret: 'keyboard cat',
    resave: true,
    saveUninitialized: false ,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store
  }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


const server = require('http').createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const ChatLog = require('./models/chat')


io.on('connection', ( socket) => { 
  console.log("connection established");
  //console.log( Object.keys(socket) );
  //console.log( socket.id );

  socket.on("add room" , (msg) => {
    socket.join(msg.room);
  });
  
  socket.on( "disconnect" , () => {
    console.log( "connection terminated");
  });
  socket.on('chat message', async (msg) => {
    socket.join( msg.room );

    let usr = await Users.findOne({
      where:{
        user_id : msg.user_id
      }
    });

    let grp = await Groups.findOne({
      where:{
        group_id: msg.room_id
      }
    });

    let chat = await Chats.create({
      message : msg.message , 
      username : msg.username, 
      user_id : usr.user_id, 
      group_id : grp.group_id , 
      groupName : grp.name
    })

    
    // const room_id = mongoose.Types.ObjectId(msg.room_id);
    // const user_id = mongoose.Types.ObjectId(msg.user_id);

    // const chat = new ChatLog({ 
    //   conn_id : socket.id , 
    //   message : msg.message , 
    //   group_name : msg.room,
    //   group : room_id, 
    //   user: user_id,
    //   username : msg.username,
    //   timestamp: new Date()
    // });

    // chat.save((err) => {
    //   if (err) {
    //     console.error(err);
    //   } else {
    //     console.log('Chat message saved in db');
    //   }
    // });

    //console.log('message: ' + msg.message + " room : " + msg.room);


    console.log(msg)
    io.to(msg.room).emit('chat message user', { message: msg.message , username : msg.username });
  });
 });

server.listen(3000  ,  () => {
  console.log("started listening at post 3000");
});
