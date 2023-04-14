var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
var SequelizeStore = require("connect-session-sequelize")(session.Store);
require("dotenv").config();
let fs = require("fs");
let _ = require("lodash");
const { v4: uuidv4 } = require('uuid');

const p = (a) => {
  console.log(a);
};

let nameAndExtension = (t)=>{
    let a = t.split('.')
    if (a.length == 1 ){
        return [t , '']
    }
    let ext = a.pop()
    a = a.join(".")
    return [a, ext]
}


module.exports = { p , nameAndExtension };
