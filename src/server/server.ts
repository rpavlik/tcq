import * as secrets from './secrets';
// important that this block come very early as appinsights shims many things
// import client from './telemetry';

import log from './logger';
import * as express from 'express';
import passport from './passport';
import routes from './router';
import * as SocketIO from 'socket.io';
import { createServer } from 'http';
import * as Session from 'express-session';
import socketHandler from './socket-hander';
import { MongoClient } from 'mongodb';
const MongoStore = require('connect-mongo');

import * as bodyParser from 'body-parser';

const app = express();
const server = createServer(app);
const io = new SocketIO.Server(server, { perMessageDeflate: false });
const port = process.env.PORT || 3000;
log.info('Starting server');
server.listen(port, function() {
  log.info('Application started and listening on port ' + port);
});

const mdbClient = new MongoClient(secrets.MONGODB_URL_SECRET);

const mdbSessionStore = MongoStore.create({ client: mdbClient });

const session = Session({
  secret: secrets.SESSION_SECRET,
  store: mdbSessionStore,
  resave: true,
  saveUninitialized: true,
});

app.use(function requireHTTPS(req, res, next) {
  if (req.get('x-site-deployment-id') && !req.get('x-arr-ssl')) {
    return res.redirect('https://' + req.get('host') + req.url);
  }

  next();
});

app.use(function(req, res, next) {
  // client.trackNodeHttpRequest({ request: req, response: res });
  next();
});
app.use(require('express-bunyan-logger')());
app.use(bodyParser.json());
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);
app.use(express.static('dist/client/'));

io.use(function(socket, next) {
  var req = socket.handshake;
  var res = {};
  session(req as any, res as any, next);
});
io.on('connection', socketHandler);

export default app;
