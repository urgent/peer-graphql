import { EventEmitter } from 'events'
import { eventEmitter } from './eventEmitter'
import { del, init } from './cache'
import { 
  GraphQLObjectType,
  GraphQLString, } from 'graphql';

  var query = '{ hello }';


/**
 
 */
export function peerGraphql() {
  // signal a peer
  
  return (query) =>  {
    // on connect, return Relay Networking fetch function.
  }
}

