import { EventEmitter } from 'events'
import { eventEmitter } from './eventEmitter'
import { del, init } from './cache'


export const state = init;

/* #region Ask GraphQL Queries */

/**
 * Fetch function for RelayEnvironment Networking.
 * Send Relay's graphql query to WebSocket for peer resolution and return response.
 * 
 * @param {unknown} operation Query from RelayEnvironment Networking
 * @param {unknown} variables Variables for query operation
 * @return {Promise<GraphQLResponseWithData>} Resolution of query by peers via WebSocket
 */
export function fetch({socket, query}:{socket:WebSocket, query:t.Mixed}) {
 
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
export function peerGraphql({schema, url, query}:{schema:GraphQLSchema, url:string, query:t.Mixed}):FetchFn  {
  // Support peers. Currying in RelayEnvironment calls this only once
  const socket = create(url);
  // Provided to RelayEnvironment Networking
  return fetch({socket, query});
}

