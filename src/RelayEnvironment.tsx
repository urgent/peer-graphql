import { Environment, Network, RecordSource, Store } from 'relay-runtime'
import { fetchPeer } from './index'

const environment = new Environment({
  network: Network.create(fetchPeer),
  store: new Store(new RecordSource())
})

export default environment