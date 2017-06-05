/**
 * Created by ryan on 2017/5/18.
 */
const mongoose = require('./init'),
    Schema = mongoose.Schema;

var wordSchema = new Schema({
  name: String,
  time: {type: Date, default: Date.now},
  word: String,
});

// 获取最近15条记录
wordSchema.statics.getWords = async function () {
  return await this.find().sort({time: -1}).limit(15);
}


var Word = mongoose.model('words', wordSchema);

module.exports = Word;
