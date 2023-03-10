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
  socket.on('chat message', (msg) => {
    socket.join( msg.room );
    
    const room_id = mongoose.Types.ObjectId(msg.room_id);
    const user_id = mongoose.Types.ObjectId(msg.user_id);
    
    const chat = new ChatLog({ 
      conn_id : socket.id , 
      message : msg.message , 
      group_name : msg.room,
      group : room_id, 
      user: user_id,
      username : msg.username,
      timestamp: new Date()
    });

    chat.save((err) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Chat message saved in db');
      }
    });

    //console.log('message: ' + msg.message + " room : " + msg.room);
    console.log(msg)
    io.to(msg.room).emit('chat message user', { message: msg.message , username : msg.username });
  });
 });

server.listen(3000  ,  () => {
  console.log("started listening at post 3000");
});
