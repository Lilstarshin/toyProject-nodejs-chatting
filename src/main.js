// @ts-check
// Templete engine: Pug
// CSS framework: WailwingCSS

/**
 * @typedef Chat
 * @property {string} type
 * @property {string} nickname
 * @property {string} message
 */

const Koa = require('koa');
const Pug = require('koa-pug');
const path = require('path');
const route = require('koa-route');
const serve = require('koa-static');
const mount = require('koa-mount');
const websockify = require('koa-websocket');
const mongoClient = require('./mongo');

const app = websockify(new Koa());

// @ts-ignore
// eslint-disable-next-line no-new
new Pug({
  viewPath: path.join(__dirname, './views'),
  app,
});

app.use(mount('/public', serve('src/public')));

app.use(async (ctx) => {
  await ctx.render('main');
});

/* eslint-disable-next-line no-underscore-dangle */
const _client = mongoClient.connect();

async function getChatCollection() {
  const client = await _client;
  return client.db('chat').collection('chats');
}
// ws == websocket
app.ws.use(
  // websocket 중에서 /test/:id 로 오면 아래 기재된 사항 처리
  route.all('/ws', async (ctx) => {
    const chatsCollection = await getChatCollection();
    const chatsCursor = chatsCollection.find(
      {},
      {
        sort: {
          createAt: 1,
        },
      }
    );

    const chats = await chatsCursor.toArray();
    ctx.websocket.send(
      JSON.stringify({
        type: 'sync',
        payload: {
          chats,
        },
      })
    );

    ctx.websocket.on('message', async (data) => {
      if (typeof data !== 'string') {
        return;
      }
      /** @type {Chat}  */
      const chat = JSON.parse(data);

      await chatsCollection.insertOne({
        ...chat,
        createdAt: new Date(),
      });

      const { nickname, message } = chat;
      const { server } = app.ws;
      if (!server) {
        return;
      }
      server.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            type: 'chat',
            payload: {
              message,
              nickname,
            },
          })
        );
      });
    });
  })
);

app.listen(4000);
