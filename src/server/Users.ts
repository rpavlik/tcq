import { Router } from 'express';
import { Handshake } from 'socket.io';
import AuthenticatedUser from '../shared/AuthenticatedUser';
import User from '../shared/User';
import GitHubSource from './githubSource';
import GitLabSource from './gitlabSource';
import { USER_SOURCE, USER_SOURCE_GITHUB, USER_SOURCE_GITLAB } from './secrets';
import UserSource from './UserSource';

class UserManager {
  source: UserSource | null = null;
  private knownUsers = new Map<string, User>();
  private knownUsersById = new Map<Number, User>();

  public useSource(source: UserSource) {
    this.source = source;
  }

  public setupPassport(passport: any) {
    this.source.setupPassport(passport, (user: User) => {
      this.addKnownUser(user);
    });
  }

  public setupRoutes(router: Router, passport: any): void {
    this.source.setupRoutes(router, passport);
  }

  public userFromHandshake(handshake: Handshake): AuthenticatedUser {
    return this.source.userFromHandshake(handshake);
  }

  public addKnownUser(user: User) {
    this.knownUsers.set(user.username, user);
    this.knownUsersById.set(user.userId, user);
  }

  public findById(id: number): User {
    return this.knownUsersById.get(id);
  }

  public async getByUsername(username: string, accessToken: string): Promise<User | null> {
    const known = this.knownUsers.get(username);
    if (known) return known;

    let user: User | null = await this.source.getByUsername(username, accessToken);
    if (user) {
      this.addKnownUser(user);
    }
    return user;
  }

  public async getByUsernames(usernames: string[], accessToken: string): Promise<User[]> {
    return Promise.all(
      usernames.map(async (u) => {
        try {
          return await this.getByUsername(u, accessToken);
        } catch (e) {
          throw new Error(`Couldn't find user '${u}'.`);
        }
      })
    );
  }
}

const Users: UserManager = new UserManager();
export default Users;

export function setupUserSource(): void {
  if (USER_SOURCE === USER_SOURCE_GITLAB) {
    Users.useSource(new GitLabSource());
  } else if (USER_SOURCE === USER_SOURCE_GITHUB) {
    Users.useSource(new GitHubSource());
  } else {
    throw 'No known user source!';
  }
}
