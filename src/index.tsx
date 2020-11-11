import { EventEmitter } from 'events'
import * as R from 'fp-ts/lib/Reader'
import { fanout } from 'fp-ts/lib/Strong'
import { pipe, flow } from 'fp-ts/lib/function'
import { eventEmitter } from './eventEmitter'
import { doSend, socket } from './websocket'
import { digestMessage } from './peerGraphQL'
import { escapeQL, escapeSocket, } from './escape'
import {GraphQLSchema} from 'graphql'
import { GraphQLResponseWithData, FetchFunction } from 'relay-runtime'
import { peerGraphql } from './peerGraphQL'
import { del, init } from './cache'
import { merge } from './graphql/merge'

type FetchFn = (operation: any, variables: any) => Promise<GraphQLResponseWithData>

export const manage = init;

/* #region Ask GraphQL Queries */

/**
 * Fetch function for RelayEnvironment Networking.
 * Send Relay's graphql query to WebSocket for peer resolution and return response.
 * 
 * @param {unknown} operation Query from RelayEnvironment Networking
 * @param {unknown} variables Variables for query operation
 * @return {Promise<GraphQLResponseWithData>} Resolution of query by peers via WebSocket
 */
async function fetch(operation:any, variables:any) {
  return pipe(
    // hash graphql query for unique listener
    await digestMessage(operation.text),
    // use hash as input for both send and _respond
    fanout({ ...R.Strong, ...R.Category })(
      // listen for websocket resolution
      listenEvent(eventEmitter),
      // send to websocketPromise<GraphQLResponseWithData>
      flow(
        // format message
        pipe({ operation, variables }, escapeQL),
        JSON.stringify,
        // send
        doSend
      )
    ),
    // convert runtime websocket promise to graphql data
    escapeSocket
  )
}

/**
 * On emitted event, delete cache and return data received.
 * 
 * @param {EventEmitter} eventEmitter EventEmitter to listen on
 * @param {string} hash event name to listen for
 * @returns {unknown} data received from event
 */
function listenEvent(eventEmitter: EventEmitter) {
  return (hash: string) => new Promise((resolve, reject) => {
    eventEmitter.once(hash, data => {
      del(`client:Resolution:${hash}`)
      resolve(data)
    })

    setTimeout(() => {
      eventEmitter.off(hash, resolve)
      reject({})
    }, 3000)
  })
}
/* #endregion */

/* #region Answer GraphQL Queries */

/**
 * On socket message, resolve graphql query and send to websocket
 * 
 * @param {string} schemaSrc Location of GraphQL schema to query with
 * @param {unknown} root GraphQL resolvers to query with
 */
async function listenSocket(schemaSrc:string, root:unknown) {
  

  socket.onmessage = peerGraphql(await pipe(schemaSrc, merge), root)
}

/* #endregion */

/**
 * Entry point to be used in Relay networking. 
 * Listen on WebSocket for GraphQL queries, resolve, and send.
 * Send GraphQL queries to WebSocket, listen for resolution, and return.
 * 
 * @param {string} schemaSrc Location of GraphQL schema for resolving queries
 * @param {unknown} root GraphQL schema resolvers
 * @returns {(any, any) => FetchFn} fetchFn for RelayEnvironment Networking
 */
export function fetchPeer(schemaSrc:string, root:unknown):FetchFn  {
  // Answer GraphQL queries. Currying runs this only once
  listenSocket(schemaSrc, root);
  // Ask GraphQL query.
  return fetch;
}