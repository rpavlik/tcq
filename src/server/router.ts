import { Router } from 'express';
import { Session } from 'express-session';
import passport from './passport';
import * as express from 'express';
const uuid = require('uuid');
import Meeting from '../shared/Meeting';
import { ensureLoggedIn } from 'connect-ensure-login';
import { resolve as resolvePath } from 'path';
import { format, promisify } from 'util';
import { readFile } from 'fs';
import { createMeeting, getMeeting } from './db';
import * as b64 from 'base64-url';
import User, { fromAuthUser, isChair } from './User';
import AuthenticatedUser from '../shared/AuthenticatedUser';
import Users from './Users';

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
  }
}
declare module 'express-session' {
  interface SessionData {
    meetingId: any;
  }
}

const rf = promisify(readFile);
// import client from './telemetry';

const router = Router();
router.get('/', async (req, res) => {
  if (req.isAuthenticated()) {
    let user = fromAuthUser(req.user);

    let path = resolvePath(__dirname, '../client/new.html');
    let contents = await rf(path, { encoding: 'utf8' });
    contents = contents.replace(
      '/head>',
      '/head><script>window.user = ' + JSON.stringify(user) + '</' + 'script>'
    );
    res.send(contents);
    res.end();
  } else {
    let path = resolvePath(__dirname, '../client/home.html');
    let contents = await rf(path, { encoding: 'utf8' });
    res.send(contents);
    res.end();
  }
});

// We include this on every page to inject some dynamic content.
router.get('/sessiondata', async (req, res) => {
  res.type('text/javascript');
  let content = format(
    'window.userSourceDescription =  %s;',
    JSON.stringify(Users.source.description)
  );
  if (req.isAuthenticated()) {
    let user = fromAuthUser(req.user);
    content += format('window.user = %s;', JSON.stringify(user));
  }
  res.send(content);
  res.end();
});

router.get('/meeting/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    req.session!.meetingId = req.params.id;
    res.redirect('/login');
    return;
  }

  let meeting;
  try {
    meeting = await getMeeting(req.params.id);
  } catch (e) {
    res.status(404);
    res.send('Meeting not found.');
    res.end();
    return;
  }

  let path = resolvePath(__dirname, '../client/meeting.html');
  let contents = await rf(path, { encoding: 'utf8' });
  let clientData = `<script>window.user_id = "${req.user.userId}"; window.isChair = ${isChair(
    req.user,
    meeting
  )}</script>`;

  // insert client data script prior to the first script so this data is available.
  let slicePos = contents.indexOf('<script');
  contents = contents.slice(0, slicePos) + clientData + contents.slice(slicePos);
  res.send(contents);
  res.end();
});

router.post('/meetings', async (req, res) => {
  res.contentType('json');
  let chairs: string = req.body.chairs.trim();

  if (typeof chairs !== 'string') {
    res.status(400);
    res.send({ message: 'Must specify chairs' });
    res.end;
    return;
  }

  // split by commas, trim, and replace leading @ from usernames
  let usernames: string[] = [];
  if (chairs.length > 0) {
    usernames = chairs.split(',').map((s) => s.trim().replace(/^@/, ''));
  }

  let chairUsers: User[] = [];
  try {
    chairUsers = await Users.getByUsernames(usernames, req.user.accessToken);
  } catch (e) {
    res.status(400);
    res.send({ message: e.message });
    res.end();
    return;
  }

  let id = b64.encode(
    [
      Math.floor(Math.random() * 2 ** 32),
      Math.floor(Math.random() * 2 ** 32),
      Math.floor(Math.random() * 2 ** 32),
    ],
    'binary'
  );

  let meeting: Meeting = {
    chairs: chairUsers,
    currentAgendaItem: undefined,
    currentSpeaker: undefined,
    currentTopic: undefined,
    timeboxEnd: undefined,
    timeboxSecondsLeft: undefined,
    agenda: [],
    queuedSpeakers: [],
    reactions: [],
    trackTemperature: false,
    id,
  };

  await createMeeting(meeting);
  // client.trackEvent({ name: 'New Meeting' });
  res.send(meeting);
  res.end();
});

Users.setupRoutes(router, passport);

router.get('/logout', function(req, res) {
  req.logout(function(err) {
    // TODO: Handle errors here?
    // if (err) {
    //   return next(err);
    // }
    res.redirect('/');
  });
});

export default router;
