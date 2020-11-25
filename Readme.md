### peer-graphql

peer-graphql provides a Relay network with little to no server resources. Concurrent users of your app and site resolve GraphQL queries in browser using only an echo WebSocket.

### Benefits

1. The same software runs your client and server.
2. No server design, installation, configuration or management. Your app does it all.
3. Servers become a utility. Instead of calling up the power company for every new application, step down the data inside your app.

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

### Short Term Roadmap

1. Split into two packages, one for dev, and one for distribution to lower bundle size.
2. Accept both schema and resolver parameters in `peerGraphql()` instead of just executable schema. Right now good for mocking, but requires setup with graphql-tools.
3. Internal architecture, more types with combinators instead of function pipes and flows. Right now, too much coupling between function composition.
4. Dedicated peers in cloud. Ship the same software on Docker and Puppeteer to run on free tier for dedicated peer coverage.
5. NaCl public key encryption between peers.
6. Build script which sources data from active peers.

### Long Term Roadmap

1. Improve validation. Mark as spam to a ML training model with tensorflow.js.
2. Remove WebSocket requirement. Look up a maintained list of open echo WebSocket channels.
3. Examples for authentication. Run OAuth provider in browser. Query includes OAuth token. Resolving peer runs OAuth to verify identity.
4. Examples for eCommerce. App bundled with public data and order form tokens. Secret key capability for payment gateway reporting. Webhook endpoints which send to WebSocket from HTTP request.
5. Allow peers to open WebRTC connections. Binary data transfer. Border gateway protocol.
