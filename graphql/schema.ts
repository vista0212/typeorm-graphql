import { makeExecutableSchema } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';

import * as User from './user';

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs: User.typeDef,
  resolvers: User.resolvers
});

export default schema;
