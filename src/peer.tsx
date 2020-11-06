import * as t from 'io-ts'
import * as E from 'fp-ts/lib/Either'
import { failure } from 'io-ts/lib/PathReporter'
import { flow, pipe } from 'fp-ts/lib/function'
import { TaskEither } from 'fp-ts/lib/TaskEither'
import { IOEither } from 'fp-ts/lib/IOEither'
import { request } from  './reducers/Request'
import { response } from './reducers/Response'
import {GraphQLSchema} from 'graphql'

interface Props {
    uri: 'request' | 'response'
    delay: number
  }

/**
 * Enforces return value from reducer to be callable
 */
export type Reduction = E.Either<
  Error,
  [TaskEither<Error, Promise<void>> | IOEither<Error, void>, Props]
>

/**
 * Respond to WebSocket payload with applicable reducer
 * @param {MessageEvent} evt WebSocket payload
 * @return {Reduction} Error or task of reducer
 */
export const reduce = (schema:GraphQLSchema, root:unknown) => (evt: MessageEvent): Reduction =>
  pipe(
    E.parseJSON(evt.data, E.toError),
    E.mapLeft(err => {
      return new Error(String(err))
    }),
    E.map(
      (json: any)=>json as Props
    ),
    E.map((props: Props) => {
      switch (props.uri) {
          case 'request':
              return [request(schema, root)(props), props];
              
          case 'response':
              return [response(props), props];
      }
    })
  )

/**
 * Run side-effects returned by reducer
 * @param {MessageEvent} evt WebSocket payload
 * @return {Reduction} Error or results of reducer call
 */
export const relay = (schema:GraphQLSchema, root:unknown) => flow(
  reduce(schema,root),
  E.map(([reduction]) => reduction())
)

/**
 * Run codec on unknown value and make errors printable
 * @param {t.Decoder<unknown, A>} codec
 * @param {unknown} i payload to decode
 * @return {E.Either<Error, A>} decode results, Error or type
 */
export function decode<A> (codec: t.Decoder<unknown, A>) {
  return flow(
    codec.decode,
    E.mapLeft(err => new Error(failure(err).join('\n')))
  )
}

/**
 * SHA-1 hash for string to unique token
 * @param {string} message generic string to hash
 * @returns {string} SHA-1 hash
 */
export async function digestMessage (message: string) {
  const msgUint8 = new TextEncoder().encode(message) // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
  return hashHex
}
