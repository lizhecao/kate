/**
 * Created by ryan on 2017/5/18.
 */
const views = require('koa-nunjucks-next'),
    config = require('./config'),
    logger = require('koa-logger'),
    convert = require('koa-convert'),
    path = require('path'),
    //session = require('koa-session'),
    db = require('./db/init'),
    log4js = require('log4js'),
    User = require('./db/users'),
    Word = require('./db/words'),
    serve = require('koa-static'),
    WebSocketServer = require('ws').Server,
    Cookies = require('cookies'),
    Koa = require('koa');

log4js.configure('config/log4js.json');
var kateLog = log4js.getLogger('kate');

const app = new Koa();
app.keys = ['my kate keys'];

app.use(logger());

app.use(serve('static'));
app.use(views('../views', {}));
//app.use(session(app));

var parseUser = async function (obj) {
  if (!obj) {
    return;
  }

  kateLog.info(`try parse: ${obj}`);

  let s = '';
  if (typeof obj === 'string') {
    s = obj;
  } else if (obj.headers) {
    let cookies = new Cookies(obj, null);
    s = cookies.get('name');
  }

  // cookies base64解码
  s = new Buffer(s, 'base64').toString();

  // 如果cookies 中的name字段 存在
  if (await User.getUserByName(s)) {
    kateLog.info('check cookies success');
    return s;
  }
}

app.use(async function (ctx, next) {
  if (ctx.path !== '/' && ctx.path !== '/login' && ctx.path !== '/error') {
    if (await parseUser(ctx.cookies.get('name'))) {
      await next();
    } else {
      ctx.redirect('/error');
    }
  } else {
    await next();
  }
});

app.use(require('./routes/login').routes());
app.use(require('./routes/home').routes());
app.use(require('./routes/error').routes());

app.on('error', function (err, ctx) {
  kateLog.info(`server error: ${err}, \n ctx: ${ctx}`);
});

let server = app.listen(config.PORT);

// 创建WebSocket, 管理所有的连接
let wss = new WebSocketServer({
  server: server
});

// 广播消息给所有client
wss.broadcast = function (data) {
  wss.clients.forEach(x => {
    x.send(data);
  });
}

// 连接的时候会创建一个  ws 连接实例
wss.on('connection', (ws, req) => {
  parseUser(req).then(name => {
    if (!name) {
      ws.close(4001, 'invalid user');
    }
    // 绑定name 和 WebSocket
    // ws.name = name;
    // ws.wss = wss;

    // 第一次连接的时候先发送15条历史消息
    Word.getWords().then(words => {
      for (let word of words.reverse()) {
        ws.send(JSON.stringify({
          word: word.word,
          name: word.name,
          type: 'talk',
        }));
      }

      // 再发送in的消息给所有人
      kateLog.info(`${name} is in`);
      wss.broadcast(JSON.stringify({
        name: name,
        type: 'in',
        word: `${name} join in...`
      }));
    });

    ws.on('message', message => {
      kateLog.info(`${name} say: ${message}`);
      let word = new Word({
        word: message,
        name: name,
      });


      wss.broadcast(JSON.stringify({
        name: name,
        type: 'talk',
        word: message,
      }));

      word.save();
    });

    ws.on('close', (code, reason) => {
      kateLog.info(`${name} is out`);
      wss.broadcast(JSON.stringify({
        name: name,
        type: 'out',
        word: `${name} is left...`
      }));
    });
  });
});