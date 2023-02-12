import { Router } from 'express';
import { Authenticator } from 'passport';
import SocketIO = require('socket.io');
import AuthenticatedUser from '../shared/AuthenticatedUser';
import User from './User';

export default interface UserSource {
  setupPassport(pass: Authenticator, userAdder: UserAdder): void;
  setupRoutes(router: Router, passport: any): void;
  getByUsername(username: string, accessToken: string): Promise<User | null>;
  userFromHandshake(handshake: SocketIO.Handshake): AuthenticatedUser;
  description: string;
}

export interface UserAdder {
  (user: User): void;
}
