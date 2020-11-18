import * as TE from 'fp-ts/lib/TaskEither'
import * as t from 'io-ts'
import * as E from 'fp-ts/lib/Either'
import { pipe, flow } from 'fp-ts/lib/function'
import { del, read } from '../cache'
import { decode } from '../decode'

/*
 * The "LoadBalance" type is a WebSocket message from a peer, requesting a query to be resolved by another peer
 * 
 * Peer that wants to run a query sends a message to WebSocket
 * If message has {uri:'resolve'}, runtime decoded to a "LoadBalance", the type in this file
 * "LoadBalance" waits a random amount. Easiest way. No complex state tracking or extra peer communication.
 * During wait, websocket messages are saved to Relay cache
 * After wait, check if exists in cache. 
 * If so, delete cache and return.
 * If not, run query to create a "Mutation"
 * "Mutation" is signed with private key, stored in Relay cache, for peer identification
 * "Mutation" is sent to WebSocket for peer to update local app state
 * 
 */


/**
 * Required properties to request peer to resolve a query
 */
const Header = t.type({
    uri: t.literal('resolve'),
    hash: t.string,
    query: t.string,
})

/**
 * Optional properties
 */
const Body = t.partial({
    variables: t.record(t.string, t.string),
})

export const LoadBalance = t.intersection([Header, Body])

/**
 * A WebSocket message from a peer in need of graphql resolution prior to runtime decoding
 */
export type LoadBalance = t.TypeOf<typeof LoadBalance>

/**
 * Wait a random amount to load balance resolve work among peers
 * 
 * @returns {(ma: TE.TaskEither<Error, LoadBalance>) => TE.TaskEither<Error, LoadBalance>} Same TE with delay added
 */
export function delay (): (
    ma: TE.TaskEither<Error, LoadBalance>
  ) => TE.TaskEither<Error, LoadBalance> {
    return ma => () => new Promise(resolve => {
        setTimeout(
            () => {ma().then(resolve)}, 
            (Math.floor(Math.random() * 30) + 1) * 20
        )
    })
}
 
  /**
   * If LoadBalance exists in cache, delete from cache and return error. If not, return unaltered LoadBalance
   * 
   * @param {LoadBalance} load LoadBalance to check
   */
  export function check(load:LoadBalance):TE.TaskEither<Error, LoadBalance> {
    return () => new Promise( async (resolve) => {
        return pipe(
            // read from cache, pass created key, and original load
            [await read(`client:Resolution:${load.hash}`), `client:Resolution:${load.hash}`, load],
            ([cache, key, load]:[unknown, string, LoadBalance, ]) => {
                if(cache) {
                    // if not deleted here, peer will never resolve another query of same hash
                    del(key);
                    resolve(E.left(new Error('Message already resolved')));
                } else {
                    resolve(E.right(load))
                }
            }
        )
    })
  }

  export const loadBalance = flow(
    decode(LoadBalance),
    TE.fromEither,
    delay(),
    TE.chain(check),
)