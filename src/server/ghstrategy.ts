import { Strategy as GitHubStrategy } from 'passport-github2';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SELF_URL } from './secrets';
import GHAuthUser from '../shared/GitHubAuthenticatedUser';
import { addKnownUser, fromGHAU } from './User';

var makeCallbackBase = function() {
  if (process.env.NODE_ENV === 'production') {
    return SELF_URL;
  }
  if (SELF_URL) {
    return SELF_URL;
  }
  return 'http://127.0.0.1:3000';
};
const callbackURL = makeCallbackBase() + '/auth/github/callback';

export default new GitHubStrategy(
  {
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL,
    scope: ['user:email'],
  },
  function(accessToken: string, refreshToken: string, profile: any, cb: any) {
    let user: GHAuthUser = {
      name: profile.displayName,
      ghUsername: profile.username!, // why might this be undefined?
      organization: (<any>profile)._json.company,
      accessToken,
      refreshToken,
      ghid: Number(profile.id), // I think this is already a number for the github API
    };

    addKnownUser(fromGHAU(user));
    cb(null, user);
  }
);
