import { EventEmitter } from 'events'
import * as R from 'fp-ts/lib/Reader'
import { fanout } from 'fp-ts/lib/Strong'
import { pipe, flow } from 'fp-ts/lib/function'
import { eventEmitter } from './eventEmitter'
import { doSend } from './websocket'
import { escapeQL, escapeSocket, } from './escape'
import { GraphQLResponseWithData } from 'relay-runtime'
import { listen, digestMessage } from './listen'
import { del, init } from './cache'
import {socket} from './websocket'
import { GraphQLSchema } from 'graphql'

type FetchFn = (operation: any, variables: any) => Promise<GraphQLResponseWithData>

export const peerBFT = init;

/* #region Ask GraphQL Queries */

/**
 * Fetch function for RelayEnvironment Networking.
 * Send Relay's graphql query to WebSocket for peer resolution and return response.
 * 
 * @param {unknown} operation Query from RelayEnvironment Networking
 * @param {unknown} variables Variables for query operation
 * @return {Promise<GraphQLResponseWithData>} Resolution of query by peers via WebSocket
 */
export async function fetch(operation:any, variables:any) {
  return pipe(
    // hash graphql query for unique listener
    await digestMessage(operation.text),
    // use hash as input for both send and _respond
    fanout({ ...R.Strong, ...R.Category })(
      // listen for websocket resolution from eventEmitter
      // Does not listen on websocket directly. Needs runtime decoding, and caching for load balancing
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
export function listenEvent(eventEmitter: EventEmitter) {
  return (hash: string) => new Promise((resolve, reject) => {
    eventEmitter.once(hash, data => {
      del(`client:Resolution:${hash}`)
      resolve(data)
    })
    setTimeout(() => {
      eventEmitter.off(hash, resolve)
      reject(new Error('Timeout waiting for peer to resolve query'))
    }, 3000)
  })
}
/* #endregion */



/**
 * Entry point to be used in Relay networking. 
 * Listen on WebSocket for GraphQL queries, resolve, and send.
 * Send GraphQL queries to WebSocket, listen for resolution, and return.
 * 
 * @param {string} schemaSrc Location of GraphQL schema for resolving queries
 * @param {unknown} resolvers GraphQL schema resolvers
 * @returns {(any, any) => FetchFn} fetchFn for RelayEnvironment Networking
 */
export function peerGraphql(schema:GraphQLSchema):FetchFn  {
  // Support peers. Currying in RelayEnvironment calls this only once
  socket.onmessage= listen(schema);
  // Provided to RelayEnvironment Networking
  return fetch;
}