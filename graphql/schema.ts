import { makeExecutableSchema } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';
import { merge } from 'lodash';

import * as User from './user';
import * as Board from './board';

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [User.typeDef, Board.typeDef],
  resolvers: merge(User.resolvers, Board.resolvers)
});

export default schema;
