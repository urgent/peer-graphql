import { Environment, Network, RecordSource, Store } from 'relay-runtime'
import { peerGraphql, peerBFT } from './index'
import { resolvers } from './graphql/root'

const environment = new Environment({
  network: Network.create(peerGraphql(resolvers)),
  store: new Store(new RecordSource())
})

// pass environment to eventEmitter for state management
peerBFT(environment)

export default environment