import { EventEmitter } from 'events'
import * as R from 'fp-ts/lib/Reader'
import { fanout } from 'fp-ts/lib/Strong'
import { pipe, flow } from 'fp-ts/lib/function'
import { eventEmitter } from './eventEmitter'
import { doSend } from './websocket'
import { digestMessage } from './peer'
import { format, runtime, } from './graphql/graphQLResponseWithData'
import {GraphQLSchema} from 'graphql'
import { commitLocalUpdate } from 'react-relay'
import { createOperationDescriptor, getRequest, GraphQLTaggedNode, Environment } from 'relay-runtime'

const respond = (eventEmitter: EventEmitter) => (hash: string) =>
  new Promise((resolve, reject) => {
    eventEmitter.once(hash, data => {
      eventEmitter.emit('state-delete', {key:`client:Response:${hash}`})
      resolve(data)
    })
    setTimeout(() => {
      eventEmitter.off(hash, resolve)
      reject({})
    }, 3000)
  })

const _respond = respond(eventEmitter)

export function fetchPeer(schema:GraphQLSchema, root:unknown) {
  return  async (operation: any, variables: any) => {
    return pipe(
      // hash graphql query for unique listener
      await digestMessage(operation.text),
      // use hash as input for both send and _respond
      fanout({ ...R.Strong, ...R.Category })(
        // listen for response
        _respond,
        // send to websocket
        flow(
          // format message
          pipe({ operation, variables }, format),
          JSON.stringify,
          // send
          doSend
        )
      ),
      // convert runtime websocket promise to graphql data
      runtime
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