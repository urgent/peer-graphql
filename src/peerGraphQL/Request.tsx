import * as TE from 'fp-ts/lib/TaskEither'
import * as t from 'io-ts'
import * as E from 'fp-ts/lib/Either'
import { pipe, flow } from 'fp-ts/lib/function'
import { del, read } from '../cache'
import { decode } from '../peerGraphQL'

/*
 * The "Request" type is a WebSocket message from a peer, requesting a query to be resolved by another peer
 * 
 * Peer sends message
 * If message has {uri:'resolve'}, runtime decoded to a "Request", the type in this file
 * "Request" waits for LB, check if not resolved. 
 * On successful decode and check, runs query and creates a "Mutation"
 * "Mutation" is signed with private key
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

export const Request = t.intersection([Header, Body])

/**
 * A WebSocket message from a peer in need of graphql resolution prior to runtime decoding
 */
export type Request = t.TypeOf<typeof Request>

/**
 * Wait a random amount to load balance resolve work among peers
 * 
 * @returns {(ma: TE.TaskEither<Error, Request>) => TE.TaskEither<Error, Request>} Same TE with delay added
 */
export function delay (): (
    ma: TE.TaskEither<Error, Request>
  ) => TE.TaskEither<Error, Request> {
    return ma => () => new Promise(resolve => {
        setTimeout(
            () => {ma().then(resolve)}, 
            (Math.floor(Math.random() * 30) + 1) * 20
        )
    })
}
 
  /**
   * If Requests exists in cache, delete from cache and return error. If not, return unaltered Request
   * 
   * @param {Request} request Request to check
   */
  export function check(request:Request):TE.TaskEither<Error, Request> {
    return () => new Promise( async (resolve) => {
        return pipe(
            // read from cache, pass created key, and original request
            [await read(`client:Resolution:${request.hash}`), `client:Resolution:${request.hash}`, request],
            ([cache, key, request]:[unknown, string, Request, ]) => {
                if(cache) {
                    // if not deleted here, peer will never resolve another query of same hash
                    del(key);
                    resolve(E.left(new Error('Message already resolved')));
                } else {
                    resolve(E.right(request))
                }
            }
        )
    })
  }

  export const validate = flow(
    decode(Request),
    TE.fromEither,
    delay(),
    TE.chain(check),
)