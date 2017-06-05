/**
 * Created by ryan on 2017/5/19.
 */
const mongoose = require('mongoose'),
    config = require('../config')
    log4js = require('log4js');

var kateLog = log4js.getLogger('kate');

mongoose.Promise = global.Promise;
mongoose.connect(config.DB_URL);

var db = mongoose.connection;

db.on('error', function (err) {
  kateLog.error(`error occured while connect: ${err}`);
});

db.once('open', function () {
  kateLog.info('open db success');
});

module.exports = mongoose;