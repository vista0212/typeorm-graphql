import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

import { User } from 'database/entities/User';
import { throwError } from './error';

dotenv.config();

export const verifyToken: (token: string) => User | void = token => {
  const secretKey: string = process.env.TOKEN_SECRET;

  const decoded: User | void = jwt.verify(token, secretKey, (err, result) => {
    if (err) {
      switch (err.name) {
        case 'JsonWebTokenError':
          throwError('JsonWebToken Error');
        default:
          throwError('Token Error');
      }
    }

    return result;
  });

  return decoded;
};
