import { EventEmitter } from 'events'
import * as R from 'fp-ts/lib/Reader'
import { fanout } from 'fp-ts/lib/Strong'
import { pipe, flow } from 'fp-ts/lib/function'
import { eventEmitter } from './eventEmitter'
import { doSend, socket } from './websocket'
import { digestMessage } from './peerGraphQL'
import { escapeQL, escapeSocket, } from './escape'
import {GraphQLSchema} from 'graphql'
import { GraphQLResponseWithData } from 'relay-runtime'
import { peerGraphql } from './peerGraphQL'
import { del, init } from './cache'

type FetchFn = (operation: any, variables: any) => Promise<GraphQLResponseWithData>

export const manage = init;

/**
 * 
 * @param eventEmitter 
 */
const listen = (eventEmitter: EventEmitter) => (hash: string) =>
  new Promise((resolve, reject) => {
    eventEmitter.once(hash, data => {
      del(`client:Resolution:${hash}`)
      resolve(data)
    })
    setTimeout(() => {
      eventEmitter.off(hash, resolve)
      reject({})
    }, 3000)
  })

/**
 * Entry point to be used in Relay networking. 
 * Send GraphQL queries to WebSocket, listen for resolution, and return.
 * Listen on WebSocket for GraphQL queries, resolve, and send.
 * 
 * @param {GraphQLSchema} schema GraphQL schema for resolving queries
 * @param {unknown} root GraphQL schema resolvers
 * @returns {(any, any) => FetchFn} fetchFn for RelayEnvironment Networking
 */
export function fetchPeer(schema:GraphQLSchema, root:unknown):FetchFn  {
  socket.onmessage = peerGraphql(schema,root)
  return async (operation, variables) => {
    return pipe(
      // hash graphql query for unique listener
      await digestMessage(operation.text),
      // use hash as input for both send and _respond
      fanout({ ...R.Strong, ...R.Category })(
        // listen for websocket resolution
        listen(eventEmitter),
        // send to websocket
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
}