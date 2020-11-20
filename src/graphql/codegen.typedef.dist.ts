import { buildSchema } from 'graphql';

export const schemaString = `scalar DateTime

type Keypair {
  pair: String
}

type Resolution {
  hash: String
  time: DateTime
}

type Query {
  resolution(hash: String): [Resolution]
  hello: String
  goodbye: String
}
`;

export default buildSchema(schemaString)