import { buildSchema } from 'graphql';

export default buildSchema(`scalar PeerGraphQLDateTime

type PeerGraphQLKeypair {
  pair: String
}

type PeerGraphQLResolution {
  hash: String
  time: PeerGraphQLDateTime
}

type Query {
  PeerGraphQLResolution(hash: String): [PeerGraphQLResolution]
  hello: String
  goodbye: String
}

schema {
  query: Query
}
`)