import {schemaString} from '../graphql/codegen.typedef.dist'
import {makeExecutableSchema} from '@graphql-tools/schema'
import { addMocksToSchema } from '@graphql-tools/mock';

// Make a GraphQL schema with no resolvers
const schema = makeExecutableSchema({ typeDefs: schemaString });

const mocks = {
    Int: () => 6,
    Float: () => 22.1,
    String: () => 'world',
    Resolution: () => {
        return ({ resolution: [{ hash: 'world', time: null }] })
    }
  };

const preserveResolvers = false;

// Create a new schema with mocks
export const schemaWithMocks = addMocksToSchema({ schema, mocks, preserveResolvers });