var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var groupUserRouter = require('./routes/group_user_actions');
var groupRouter = require('./routes/group_actions');
var chatRouter = require('./routes/chats');



var app = express();

var flash = require('connect-flash');
app.use(flash());


const { Sequelize, Op, Model, DataTypes } = require("sequelize");

const db = require('./models'); 

const sequelize = db.sequelize;

const Users = db.Users ;
const Groups = db.Groups;
const Group_User = db.Group_User ;
const Chats = db.Chats ;



app.use(session(
  { secret: 'keyboard cat',
    resave: true,
    saveUninitialized: false ,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
  })
);

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
app.use('/', authRouter);
app.use( '/' , groupRouter);
app.use('/group/' , groupUserRouter);
app.use('/chat/' , chatRouter);


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


io.on('connection', ( socket) => { 
  console.log("connection established");
  
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

    console.log(msg)
    io.to(msg.room).emit('chat message user', { message: msg.message , username : msg.username });
  });

  socket.on('chat message 2', async (msg) => {
    //socket.join( msg.room );

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

    console.log(msg)
    io.to(msg.room).emit('chat message user', { message: msg.message , username : msg.username });
  });

 });

server.listen(3000  ,  () => {
  console.log("started listening at post 3000");
});
