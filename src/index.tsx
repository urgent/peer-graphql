import { EventEmitter } from 'events'
import * as R from 'fp-ts/lib/Reader'
import { fanout } from 'fp-ts/lib/Strong'
import { pipe, flow } from 'fp-ts/lib/function'
import { eventEmitter } from './eventEmitter'
import { doSend, socket } from './websocket'
import { digestMessage } from './peerGraphQL'
import { escapeQL, escapeSocket, } from './escape'
import {GraphQLSchema} from 'graphql'
import { commitLocalUpdate } from 'react-relay'
import { createOperationDescriptor, getRequest, GraphQLTaggedNode, Environment, GraphQLResponseWithData } from 'relay-runtime'
import { peerGraphql } from './peerGraphQL'

type FetchFn = (operation: any, variables: any) => Promise<GraphQLResponseWithData>

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

export const read = (key:string) => new Promise((resolve, reject)=>{
  eventEmitter.once(key, data => {
    resolve(data)
  })
  eventEmitter.emit('state-read',{key});
})

export const write = (data: {key:string, type:string, query:GraphQLTaggedNode, variables?:unknown, value?: string, name?:string  }) => {
  eventEmitter.emit('state-write',data)
}

export const del = (key:string) => {
  eventEmitter.emit('state-delete',key)
}

export const manage = (environment:Environment) => {
  eventEmitter.on('state-read', ({key}) => {
    eventEmitter.emit(key,environment.getStore()
    .getSource()
    .get(key))
  })

  eventEmitter.on('state-write', ({key, type, value, name, query, variables}) => {
    commitLocalUpdate(environment, store => {
      const record = store.create(key, type)
      record.setValue(
        value,
        name
      )
    })
    // used for gc
    const concreteRequest = getRequest(query)
    const operation = createOperationDescriptor(concreteRequest, variables)
    environment.retain(operation)
  })

  eventEmitter.on('state-delete', ({key}) => {
    commitLocalUpdate(environment, store => {
      store.delete(key)
    })
  })
}