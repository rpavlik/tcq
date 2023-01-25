import { Strategy as GitLabStrategy } from 'passport-gitlab2';
import { GITLAB_CLIENT, GITLAB_HOST, SELF_URL, USER_SOURCE_GITLAB } from './secrets';
import AuthUser from '../shared/AuthenticatedUser';
import User, { fromAuthUser } from './User';
import { Gitlab } from '@gitbeaker/node';
import UserSource, { UserAdder } from './UserSource';
import { Authenticator } from 'passport';
import AuthenticatedUser from '../shared/AuthenticatedUser';
import { Handshake } from 'socket.io';
import { Router } from 'express';
import log from './logger';
import { format } from 'util';

let makeCallbackBase = function() {
  if (process.env.NODE_ENV === 'production') {
    return SELF_URL;
  }
  if (SELF_URL) {
    return SELF_URL;
  }
  return 'http://127.0.0.1:3000';
};
const callbackURL = makeCallbackBase() + '/auth/gitlab/callback';

class GitLabSource implements UserSource {
  constructor() {
    if (!GITLAB_HOST) {
      log.error('GITLAB_HOST not set');
    }
  }

  description: string = format('GitLab (%s)', GITLAB_HOST);

  setupRoutes(router: Router, passport: any): void {
    router.get('/login', function(req, res) {
      // client.trackEvent({ name: 'home-login', properties: { ref: req.query.ref } });
      res.redirect('/auth/gitlab');
    });

    router.get('/auth/gitlab', passport.authenticate('gitlab'));
    router.get(
      '/auth/gitlab/callback',
      passport.authenticate('gitlab', { failureRedirect: '/login' }),
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
  userFromHandshake(handshake: Handshake): AuthUser {
    let hsUser = (handshake as any).session.passport.user;

    let user: AuthenticatedUser = {
      name: hsUser.name,
      organization: '',
      userId: hsUser.userId,
      username: hsUser.username,
      userSource: USER_SOURCE_GITLAB,
      accessToken: hsUser.accessToken,
      refreshToken: hsUser.refreshToken,
    };
    log.info({ username: user.username, name: user.name }, 'userFromHandshake: ', user.name);
    return user;
  }
  public setupPassport(passport: Authenticator, userAdder: UserAdder) {
    passport.use(
      new GitLabStrategy(
        {
          clientID: GITLAB_CLIENT.id,
          clientSecret: GITLAB_CLIENT.secret,
          callbackURL,
          baseURL: 'https://' + GITLAB_HOST + '/',
        },
        function(accessToken: string, refreshToken: string, profile: any, cb: any) {
          let user: AuthUser = {
            accessToken,
            name: profile.displayName,
            organization: '',
            refreshToken,
            userId: Number(profile.id),
            username: profile.username!,
            userSource: USER_SOURCE_GITLAB,
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
      if (obj.userSource === USER_SOURCE_GITLAB) {
        cb(null, obj as AuthenticatedUser);
      } else {
        cb(null, false);
      }
    });
  }
  public async getByUsername(username: string, accessToken: string): Promise<User> {
    const api = new Gitlab({
      host: GITLAB_HOST,
      oauthToken: accessToken,
    });
    let res = await api.Users.username(username);
    if (res.length > 0) {
      let user: User = {
        userId: res[0].id,
        username: res[0].username,
        name: res[0].name,
        organization: '',
        userSource: USER_SOURCE_GITLAB,
      };
      return user;
    }
    return null;
  }
}

export default GitLabSource;
