/**
 * Created by ryan on 2017/5/19.
 */
const Router = require('koa-router'),
    User = require('../db/users'),
    log4js = require('log4js');

var kateLog = log4js.getLogger('kate');

const router = new Router();

router.get('/', async (ctx, next) => {
  await ctx.render('login');
});

router.get('/login', async (ctx, next) => {
  var query = ctx.request.query;
  let name = query.name;
  let user = await User.getUserByName(name);
  if (user && user.passwd === query.passwd) {
    kateLog.info(`user ${name} login`);
    ctx.cookies.set('name', new Buffer(name).toString('base64'));
    ctx.redirect('/talk');
  } else {
    ctx.redirect('/error');
  }
});

module.exports = router;