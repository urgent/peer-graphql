import { commitLocalUpdate } from 'react-relay'
import { createOperationDescriptor, getRequest, GraphQLTaggedNode, Environment } from 'relay-runtime'
import { eventEmitter } from './eventEmitter'

/* ****************************************************************************************************
  the only reason events are used is commitLocalUpdate requires the RelayEnvironment
  peerGraphQL is used to build the RelayEnvironment
  so peerGraphQL is passed to environment, then environment is passed here to init local state management
   ****************************************************************************************************
*/

/**
 * Initialize local state management with Relay environment
 * EventEmitter decouples Relay Networking and commitLocalUpdate
 * this provides listeners for state-read, state-write, and state-delete events
 * 
 * @param {Environment} environment Relay environment for commitLocalUpdate
 */
export const init = (environment:Environment) => {
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