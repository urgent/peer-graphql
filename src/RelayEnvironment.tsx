import { Environment, Network, RecordSource, Store } from 'relay-runtime'
import { fetchPeer, manage } from './index'
import { schema, root } from './graphql/resolve'

const environment = new Environment({
  network: Network.create(fetchPeer(schema, root)),
  store: new Store(new RecordSource())
})

// pass environment to eventEmitter for state management
manage(environment)

export default environment