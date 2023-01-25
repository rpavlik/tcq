import * as passport from 'passport';
import Users, { setupUserSource } from './Users';

setupUserSource();
Users.setupPassport(passport);

export default passport;
