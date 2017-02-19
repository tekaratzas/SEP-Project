var env = process.env.NODE_ENV || 'development';
//var env = "production";
var mysql = require('mysql')
  , async = require('async')
  , config = require('./config')[env]
  , schema = require('./schema');

var db = {};

var state = {
  pool: null,
  mode: null,
}

db.connect = function(mode, done) {
  if (state.pool != null) {
    return done();
  }
  
  state.pool = mysql.createPool({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.db,
    multipleStatements: true
  });
  state.mode = mode;
  done();
}

db.get = function() {
  return state.pool
}


module.exports = db;