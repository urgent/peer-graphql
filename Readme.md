### peer-graphql

peer-graphql provides a Relay network with little to no server resources. Concurrent users of your app and site resolve GraphQL queries in browser using only an echo WebSocket.

### Benefits

1. One single source of software.
2. Peer-to-peer and device-to-device communication.
3. Turn "server" into a utility, with as much thought as power from the electrical outlet.

### Installation

1. Install with yarn or npm:

```
yarn add peer-graphql
```

2. Run a npx script to tell peer-graphql about your schema:

```
npx peer-graphql ./your-schema.graphql
```

3. Use peer-graphql for the Relay network, with an executable GraphQL schema and a WebSocket echo endpoint

```javascript
// Export a singleton instance of Relay Environment configured with our network function:
const relay = new Environment({
    network: Network.create(
        peerGraphql({
            schema:<YOUR_EXECUTABLE_GraphQLSchema_WITH_RESOLVERS>,
            url: 'wss://<YOUR_WEBSOCKET_ADDRESS>'
        })
    ),
    store: new Store(new RecordSource()),
});
```

4. Provide the Relay environment to peer-graphql state management:

```javascript
state(relay)
```

### Roadmap

1. Internal housekeeping, more types with combinators instead of function pipes and flows. Right now, too much coupling between composed functions.
2. Remove WebSocket requirement. Look up a maintained list of open echo WebSocket channels.
3. ML models for authoritative data responses across open WebSocket. BFT avoided due to CUPS, consensus across unknown participants. Want it easy
4.
