import User from '../shared/User';
import AuthenticatedUser from '../shared/AuthenticatedUser';
import Meeting from '../shared/Meeting';
import Users from './Users';

export function addKnownUser(user: User) {
  Users.addKnownUser(user);
}

export function fromAuthUser(user: AuthenticatedUser): User {
  return {
    name: user.name,
    organization: user.organization,
    userSource: user.userSource,
    userId: user.userId,
    username: user.username,
  };
}

export function isChair(user: AuthenticatedUser | User, meeting: Meeting): boolean {
  return (
    meeting.chairs.length === 0 ||
    meeting.chairs.some((c) => c.userId === user.userId && c.userSource === user.userSource)
  );
}

export default User;
