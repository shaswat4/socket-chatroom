const mongoose = require('mongoose');


const ChatLogSchema = new mongoose.Schema({
    conn_id: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    group_name : {
      type: String,
      required: true
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'groups', 
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users', // Change the ref option to match your collection name
      required: true
    },
    username: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  });

module.exports = mongoose.model('Chat', ChatLogSchema);