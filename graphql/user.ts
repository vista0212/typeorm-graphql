import { Repository, getRepository } from 'typeorm';
import { gql } from 'apollo-server-express';
import { pbkdf2, pbkdf2Sync, verify } from 'crypto';
import * as dotenv from 'dotenv';
import * as randomstring from 'randomstring';
import * as jwt from 'jsonwebtoken';

import { User, findByPk, findByEmail } from 'database/entities/User';
import { catchDBError, throwError } from '@Lib/error';
import { verifyToken } from '@Lib/utils';

dotenv.config();

export const typeDef = gql`
  type User {
    pk: String!
    email: String!
    password: String!
    passwordKey: String!
    name: String!
    createdAt: String!
    updatedAt: String!
  }

  type UserWithToken {
    user: User!
    token: String!
  }

  type Query {
    user(pk: String): User!
    allUsers: [User]!
    register(email: String, password: String, name: String): Boolean!
    login(email: String, password: String): UserWithToken!
  }

  type Mutation {
    updateUser(token: String, email: String, name: String, password: String): UserWithToken!
    unRegister(token: String, password: String): Boolean!
  }
`;

const PW_CONFIG: { ITERATION: number; KEY_LENGTH: number; DIGEST: string } = {
  ITERATION: parseInt(process.env.PASSWORD_ENCRYPTION_ITERATION, 10),
  KEY_LENGTH: parseInt(process.env.PASSWORD_ENCRYPTION_KEY_LENGTH, 10),
  DIGEST: process.env.PASSWORD_ENCRYPTION_DIGEST
};

const passwordEncryption: (
  password: User['password'],
  passwordKey: User['passwordKey']
) => User['password'] = (password, passwordKey) => {
  const encryptionPassword: User['password'] = pbkdf2Sync(
    password,
    passwordKey,
    PW_CONFIG.ITERATION,
    PW_CONFIG.KEY_LENGTH,
    PW_CONFIG.DIGEST
  ).toString('base64');

  return encryptionPassword;
};

const issueToken: (pk: User['pk']) => string = pk => {
  const secretKey: string = process.env.TOKEN_SECRET;

  const token: string = jwt.sign(
    {
      pk
    },
    secretKey,
    {
      expiresIn: '1h'
    }
  );

  return token;
};

export const resolvers = {
  Query: {
    user: async (_: any, { pk }: { pk: User['pk'] }) => {
      const userRepository: Repository<User> = getRepository(User);
      const user: User = await userRepository
        .findOne({
          where: {
            pk
          }
        })
        .catch(catchDBError());

      if (!user) {
        throwError('Not Found User');
      }

      return user;
    },
    allUsers: async () => {
      const userRepository: Repository<User> = getRepository(User);
      const user: User[] = await userRepository.find().catch(catchDBError());

      if (!user.length) {
        throwError('Not Found Users');
      }

      return user;
    },
    register: async (
      _: any,
      {
        email,
        password,
        name
      }: {
        email: User['email'];
        password: User['password'];
        name: User['name'];
      }
    ) => {
      const userRepository: Repository<User> = getRepository(User);

      const existUser: User = await findByEmail(userRepository, email);
      if (existUser) {
        throwError('Exist User');
      }

      const passwordKey: User['passwordKey'] = randomstring.generate(64);
      const encryptionPassword: User['password'] = passwordEncryption(password, passwordKey);

      const user: User = await userRepository
        .save({
          email,
          password: encryptionPassword,
          passwordKey,
          name
        })
        .catch(catchDBError());

      return true;
    },
    login: async (
      _: any,
      {
        email,
        password
      }: {
        email: User['email'];
        password: User['password'];
      }
    ) => {
      const userRepository: Repository<User> = getRepository(User);

      const user: User = await findByEmail(userRepository, email);

      if (!user) {
        throwError('Invalid Data');
      }

      const encryptionPassword: User['password'] = passwordEncryption(password, user.passwordKey);

      if (user.password !== encryptionPassword) {
        throwError('Invalid Data');
      }

      const token: string = issueToken(user.pk);

      return {
        user,
        token
      };
    }
  },
  Mutation: {
    updateUser: async (
      _: any,
      {
        token,
        email,
        name,
        password
      }: {
        token: string;
        email: User['email'];
        name: User['name'];
        password: User['password'];
      }
    ) => {
      const userRepository: Repository<User> = getRepository(User);

      const { pk }: { pk: User['pk'] } = verifyToken(token) as User;

      const user: User = await findByPk(userRepository, pk).catch(catchDBError());

      if (!user) {
        throwError('Invalid Token');
      }

      const encryptionPassword: User['password'] = passwordEncryption(password, user.passwordKey);

      Object.assign(user, { email, name, encryptionPassword });

      await userRepository.save(user);

      const reIssuedToken: string = issueToken(user.pk);

      return {
        user,
        token: reIssuedToken
      };
    },
    unRegister: async (
      _: any,
      {
        token,
        password
      }: {
        token: string;
        password: User['password'];
      }
    ) => {
      const userRepository: Repository<User> = getRepository(User);
      const { pk }: { pk: User['pk'] } = verifyToken(token) as User;

      const user: User = await findByPk(userRepository, pk);

      if (!user) {
        throwError('Invalid Token');
      }

      const encryptionPassword: User['password'] = passwordEncryption(password, user.passwordKey);

      if (user.password !== encryptionPassword) {
        throwError('Invalid Password');
      }

      await userRepository.remove(user);

      return true;
    }
  }
};
