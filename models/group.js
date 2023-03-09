const mongoose = require('mongoose');

module.exports = mongoose.model('group', {
    name : {
      type: String,
      required: true
     },
    description : String , 
    admin : [ {username :String}] , 
    users : [ {username :String}]
  });
