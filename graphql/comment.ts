import { gql } from 'apollo-server-express';
import { Board } from 'database/entities/Board';
import { Comment } from 'database/entities/comment';
import { Repository, getRepository } from 'typeorm';
import { User, findByPk } from 'database/entities/User';
import { verifyToken } from '@Lib/utils';
import { throwError, catchDBError } from '@Lib/error';

export const typeDef = gql`
  type Comment {
    pk: Int!
    user_pk: String!
    board_pk: Int!
    content: String!
    createdAt: Date!
    updatedAt: Date!
  }

  extend type Query {
    comments(board_pk: Int!): [Comment]!
    createComment(token: String!, board_pk: Int!, content: String!): Boolean!
  }

  extend type Mutation {
    updateComment(token: String!, board_pk: Int!, comment_pk: Int!, content: String!): Boolean!
    deleteComment(token: String!, board_pk: Int!, comment_pk: Int!): Boolean!
  }
`;

export const resolvers = {
  Query: {
    comments: async (
      _: any,
      {
        board_pk
      }: {
        board_pk: Board['pk'];
      }
    ) => {
      const commentRepository: Repository<Comment> = getRepository(Comment);

      const comments: Comment[] = await commentRepository
        .find({
          where: {
            board_pk
          }
        })
        .catch(catchDBError());

      return comments;
    },
    createComment: async (
      _: any,
      {
        token,
        board_pk,
        content
      }: {
        token: string;
        board_pk: Board['pk'];
        content: Comment['content'];
      }
    ) => {
      const commentRepository: Repository<Comment> = getRepository(Comment);
      const userRepository: Repository<User> = getRepository(User);
      const boardRepository: Repository<Board> = getRepository(Board);

      const user_pk: User['pk'] = (verifyToken(token) as User).pk;

      const user: User = await findByPk(userRepository, user_pk);

      if (!user) {
        throwError('Not Found User');
      }

      const board: Board = await boardRepository.findOne({
        where: {
          pk: board_pk
        }
      });

      if (!board) {
        throwError('Not Found Board');
      }

      await commentRepository
        .save({
          user_pk,
          board_pk,
          content
        })
        .catch(catchDBError());

      return true;
    }
  },
  Mutation: {
    updateComment: async (
      _: any,
      {
        token,
        board_pk,
        comment_pk,
        content
      }: {
        token: string;
        board_pk: Board['pk'];
        comment_pk: Comment['pk'];
        content: Comment['content'];
      }
    ) => {
      const boardRepository: Repository<Board> = getRepository(Board);
      const userRepository: Repository<User> = getRepository(User);
      const commentRepository: Repository<Comment> = getRepository(Comment);

      const pk: User['pk'] = (verifyToken(token) as User).pk;

      const user: User = await findByPk(userRepository, pk);

      if (!user) {
        throwError('Not Found User');
      }

      const board: Board = await boardRepository
        .findOne({
          where: {
            pk: board_pk
          }
        })
        .catch(catchDBError());

      if (!board) {
        throwError('Not Found Board');
      }

      const comment: Comment = await commentRepository
        .findOne({
          where: {
            pk: comment_pk,
            board_pk
          }
        })
        .catch(catchDBError());

      if (!comment) {
        throwError('Not Found Comment');
      }

      if (comment.user_pk !== user.pk) {
        throwError('Forbidden');
      }

      Object.assign(comment, { content });

      await comment.save().catch(catchDBError());

      return true;
    },
    deleteComment: async (
      _: any,
      {
        token,
        board_pk,
        comment_pk
      }: {
        token: string;
        board_pk: Board['pk'];
        comment_pk: Comment['pk'];
      }
    ) => {
      const boardRepository: Repository<Board> = getRepository(Board);
      const commentRepository: Repository<Comment> = getRepository(Comment);
      const userRepository: Repository<User> = getRepository(User);

      const pk: User['pk'] = (verifyToken(token) as User).pk;

      const user: User = await findByPk(userRepository, pk);

      if (!user) {
        throwError('Not Found User');
      }

      const board: Board = await boardRepository
        .findOne({
          where: {
            pk: board_pk
          }
        })
        .catch(catchDBError());

      if (!board) {
        throwError('Not Found Board');
      }

      const comment: Comment = await commentRepository
        .findOne({
          where: {
            pk: comment_pk
          }
        })
        .catch(catchDBError());

      if (!comment) {
        throwError('Not Found Comment');
      }

      if (comment.user_pk !== user.pk) {
        throwError('Forbidden');
      }

      await comment.remove();

      return true;
    }
  }
};
