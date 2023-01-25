// must come first
require('dotenv').config();

import log from './logger';

const prod = process.env.NODE_ENV === 'production';

export const USER_SOURCE = process.env['TCQ_USER_SOURCE']!;
export const USER_SOURCE_GITLAB = 'gitlab';
export const USER_SOURCE_GITHUB = 'github';

function getSecretAndId(envVarAbbrev, shouldRequire) {
  var prefix = 'TCQ_' + (prod ? '' : 'LOCAL_') + envVarAbbrev;
  var secretEnv = prefix + '_SECRET';
  var idEnv = prefix + '_ID';
  var creds = {
    secret: process.env[secretEnv]!,
    id: process.env[idEnv]!,
  };
  if (shouldRequire) {
    if (!creds.secret) {
      log.fatal('ERROR\tNo client secret. Set ' + secretEnv);
      process.exit(1);
    }
    if (!creds.id) {
      log.fatal('ERROR\tNo client id. Set ' + idEnv);
      process.exit(1);
    }
  }
  return creds;
}

// GitHub configuration
export const GITHUB_CLIENT = getSecretAndId('GH', USER_SOURCE === USER_SOURCE_GITHUB);

// GitLab configuration
export const GITLAB_CLIENT = getSecretAndId('GL', USER_SOURCE === USER_SOURCE_GITLAB);
export const GITLAB_HOST = process.env['TCQ_GL_HOST']!;

// Other config
export const SESSION_SECRET = process.env['TCQ_SESSION_SECRET']!;

export const SELF_URL = prod ? process.env['TCQ_SELF_URL']! : process.env['TCQ_LOCAL_SELF_URL']!;

export const MONGODB_URL_SECRET = prod
  ? process.env['TCQ_MONGODB_URL']!
  : process.env['TCQ_LOCAL_MONGODB_URL']!;

// export const AI_IKEY = process.env['TCQ_AI_IKEY'];

if (!USER_SOURCE) {
  log.fatal('ERROR\tNo user source. Set TCQ_USER_SOURCE to github or gitlab.');
  process.exit(1);
} else if (USER_SOURCE !== USER_SOURCE_GITLAB && USER_SOURCE !== USER_SOURCE_GITHUB) {
  log.fatal('ERROR\tTCQ_USER_SOURCE not recognized. Set TCQ_USER_SOURCE to github or gitlab.');
  process.exit(1);
}

if (!SESSION_SECRET) {
  log.fatal('ERROR\tNo session secret. Set TCQ_SESSION_SECRET.');
  process.exit(1);
}

if (prod && !SELF_URL) {
  log.fatal('ERROR\tNo self URL set. Set TCQ_SELF_URL or TCQ_LOCAL_SELF_URL.');
  process.exit(1);
}

if (!MONGODB_URL_SECRET) {
  log.fatal('ERROR\tNo MongoDB/FerretDB secret. Set TCQ_MONGODB_URL or TCQ_LOCAL_MONGODB_URL.');
  process.exit(1);
}
// if (!AI_IKEY) {
//   log.fatal('ERROR\tNo Application Insights Instrumentation Key. Set TCQ_AI_IKEY.');
//   process.exit(1);
// }
