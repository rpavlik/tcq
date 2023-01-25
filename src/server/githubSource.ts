import { Strategy as GitHubStrategy } from 'passport-github2';
import { GITHUB_CLIENT, SELF_URL, USER_SOURCE_GITHUB } from './secrets';
import AuthUser from '../shared/AuthenticatedUser';
import User, { fromAuthUser } from './User';
import UserSource, { UserAdder } from './UserSource';
import { Router } from 'express';
import { Authenticator } from 'passport';
import AuthenticatedUser from '../shared/AuthenticatedUser';
import ghapi from './ghapi';
import { Handshake } from 'socket.io';
import log from './logger';

let makeCallbackBase = function() {
  if (process.env.NODE_ENV === 'production') {
    return SELF_URL;
  }
  if (SELF_URL) {
    return SELF_URL;
  }
  return 'http://127.0.0.1:3000';
};
const callbackURL = makeCallbackBase() + '/auth/github/callback';

class GitHubSource implements UserSource {
  description: string = 'GitHub';
  setupRoutes(router: Router, passport: any): void {
    router.get('/login', function(req, res) {
      // client.trackEvent({ name: 'home-login', properties: { ref: req.query.ref } });
      res.redirect('/auth/github');
    });

    router.get('/auth/github', passport.authenticate('github'));
    router.get(
      '/auth/github/callback',
      passport.authenticate('github', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        if (req.session!.meetingId) {
          res.redirect('/meeting/' + req.session!.meetingId);
          delete req.session!.meetingId;
        } else {
          res.redirect('/');
        }
      }
    );
  }
  userFromHandshake(handshake: Handshake): AuthenticatedUser {
    let hsUser = (handshake as any).session.passport.user;

    let user: AuthenticatedUser = {
      name: hsUser.name,
      organization: hsUser.organization,
      userId: hsUser.userId,
      username: hsUser.username,
      userSource: USER_SOURCE_GITHUB,
      accessToken: hsUser.accessToken,
      refreshToken: hsUser.refreshToken,
    };
    log.info({ username: user.username, name: user.name }, 'userFromHandshake: ', user.name);
    return user;
  }
  public setupPassport(passport: Authenticator, userAdder: UserAdder) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: GITHUB_CLIENT.id,
          clientSecret: GITHUB_CLIENT.secret,
          callbackURL,
          scope: ['user:email'],
        },
        function(accessToken: string, refreshToken: string, profile: any, cb: any) {
          let user: AuthUser = {
            accessToken,
            name: profile.displayName,
            organization: (<any>profile)._json.company,
            refreshToken,
            userId: Number(profile.id),
            username: profile.username!, // why might this be undefined?
            userSource: USER_SOURCE_GITHUB,
          };
          log.info(
            { username: user.username, name: user.name, source: user.userSource },
            'passport success: ',
            user.name
          );

          userAdder(fromAuthUser(user));
          cb(null, user);
        }
      )
    );
    passport.serializeUser(function(user, cb) {
      cb(null, user);
    });

    passport.deserializeUser(function(obj: any, cb) {
      if (obj.userSource === USER_SOURCE_GITHUB) {
        cb(null, obj as AuthenticatedUser);
      } else {
        cb(null, false);
      }
    });
  }
  public async getByUsername(username: string, accessToken: string): Promise<User> {
    // TODO: investigate rate limiting on this API?
    let res = await ghapi(accessToken).users.getByUsername({ username: username });

    let user: User = {
      userId: res.data.id,
      username: username,
      name: res.data.name,
      organization: res.data.company,
      userSource: USER_SOURCE_GITHUB,
    };
    return user;
  }
}

export default GitHubSource;
