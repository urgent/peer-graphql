import { buildSchema } from 'graphql';

export default buildSchema(`scalar DateTime

type Keypair {
  pair: String
}

type Resolution {
  hash: String
  time: DateTime
}

type Query {
  hello: String
  goodbye: String
  resolution(hash: String): [Resolution]
}
`)