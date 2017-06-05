/**
 * Created by ryan on 2017/5/18.
 */
const Router = require('koa-router'),
    Word = require('../db/words'),
    WebSocket = require('ws');
    User = require('../db/users');

const router = new Router();

router.get('/talk', async (ctx) => {
  await ctx.render('home');
});


module.exports = router;