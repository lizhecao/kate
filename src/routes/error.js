/**
 * Created by ryan on 2017/5/19.
 */
const Router = require('koa-router'),
    log4js = require('log4js');

var kateLog = log4js.getLogger('kate');

const router = new Router();

router.get('/error', async (ctx, next) => {
  await ctx.render('error');
});

module.exports = router;