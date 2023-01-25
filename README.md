# TCQ

Queue for Technical Committee meetings. Originally for TC39.

This fork is maintained by @rpavlik for more general usage.

## Environment Variables for Configuration

- If using GitHub:
  - `TCQ_GH_SECRET` (`TCQ_LOCAL_GH_SECRET` for dev mode) - GitHub client secret
  - `TCQ_GH_ID` (`TCQ_LOCAL_GH_ID` for dev mode) - GitHub client ID
  - `TCQ_USER_SOURCE=github`
- If using GitLab:
  - `TCQ_GL_SECRET` (`TCQ_LOCAL_GL_SECRET` for dev mode) - GitLab client secret
  - `TCQ_GL_ID` (`TCQ_LOCAL_GL_ID` for dev mode) - GitLab client ID
  - `TCQ_GL_HOST` - The domain name for the GitLab instance of interest.
  - `TCQ_USER_SOURCE=gitlab`
- `TCQ_SESSION_SECRET` - Secret for session storage, can be arbitrarily generated (?)
- `TCQ_SELF_URL` (`TCQ_LOCAL_SELF_URL` for dev mode) - URL (no trailing slash) of the app
  - GitHub: You will need to set `${TCQ_SELF_URL}/auth/github/callback` as the callback URL in your
    GitHub Application settings.
  - GitLab: You will need to set `${TCQ_SELF_URL}/auth/gitlab/callback` as the callback URL in your
    GitLab Application settings.
  - As a special case, if you're in dev mode and don't have this set, it defaults to `http://127.0.0.1:3000`
- `TCQ_MONGODB_URL`  (`TCQ_LOCAL_MONGODB_URL` for dev mode) - URL/connection string for your
  MongoDB or compatible (FerretDB, etc) document database.

