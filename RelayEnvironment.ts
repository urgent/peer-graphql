import { Environment, Network, RecordSource, Store } from 'relay-runtime'


const environment = new Environment({
  network: Network.create(peerGraphql()),
  store: new Store(new RecordSource())
})

// pass environment to eventEmitter for state management
state(environment)

export default environment