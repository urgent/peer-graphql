import { Environment, Network, RecordSource, Store } from 'relay-runtime'


const environment = new Environment({
  network: Network.create(peerGraphql({
    schema:schemaWithMocks, 
    url:'wss://connect.websocket.in/v3/1?apiKey=4sC6D9hsMYg5zcl15Y94nXNz8KAxr8eezGglKE9FkhRLnHcokuKsgCCQKZcW',
    query:Query
  })),
  store: new Store(new RecordSource())
})

// pass environment to eventEmitter for state management
state(environment)

export default environment