import User from './User';
export default interface AuthenticatedUser extends User {
  accessToken: string;
  refreshToken: string;
}
