/**
 * Created by ryan on 2017/5/19.
 */
/**
 * Created by ryan on 2017/5/18.
 */
const mongoose = require('./init'),
    Schema = mongoose.Schema,
    log4js = require('log4js');

var kateLog = log4js.getLogger('kate');

var userSchema = new Schema({
  name: String,
  passwd: String,
});

userSchema.statics.getUserByName = async function (name) {
  return await this.findOne({name: name});
}

userSchema.statics.getUserById = async function (docId) {
  try {
    var id = new mongoose.Types.ObjectId(docId);
    var user = await this.findById(id);
    return user;
  } catch (e) {
    kateLog.info(`getUserById error: ${e}`);
  }
};

var User = mongoose.model('users', userSchema);

module.exports = User;