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
  resolution(hash: String): [Resolution]
  hello: String
  goodbye: String
}
`)