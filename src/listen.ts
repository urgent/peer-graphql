import * as t from 'io-ts'
import * as E from 'fp-ts/lib/Either'
import { failure } from 'io-ts/lib/PathReporter'
import { flow, pipe } from 'fp-ts/lib/function'
import { TaskEither } from 'fp-ts/lib/TaskEither'
import { IOEither } from 'fp-ts/lib/IOEither'
import { resolve } from  './listen/Resolve'
import { mutate } from './listen/Mutate'
import { MessageEvent } from 'ws'

/**
 * Minimum properties of WebSocket message to invoke a command
 */
interface Props {
  uri: 'resolve' | 'mutate'
}

/**
 * Result of command invoked by WebSocket
 */
export type Effect = E.Either<
  Error,
  [TaskEither<Error, Promise<void>> | IOEither<Error, void>, Props]
>

/**
 * Use WebSocket to invoke commands
 * @param {MessageEvent} evt WebSocket payload
 * @return {Effect} Error or side effects
 */

export const call = (root:unknown) => (evt: MessageEvent): Effect =>
  pipe(
    E.parseJSON(evt.data as string, E.toError),
    E.mapLeft(err => {
      return new Error(String(err))
    }),
    E.map(
      (json: any)=>json as Props
    ),
    E.map((props: Props) => {
      switch (props.uri) {
          case 'resolve':
              return [resolve(root)(props), props];
              
          case 'mutate':
              return [mutate(props), props];
      }
    })
  )

/**
 * Parse and decode WebSocket message, call command, and perform side effects.
 * @param {MessageEvent} evt WebSocket payload
 * @return {Either<Error, void>} Side effect evaluation results
 */
export const listen = (resolvers:unknown) => flow(
  call(resolvers),
  E.map(([effect]) => effect())
)


// ---------- Commonly used functions ----------


/**
 * Run codec on unknown value and make errors printable
 * @param {t.Decoder<unknown, A>} codec
 * @param {unknown} i payload to decode
 * @return {E.Either<Error, A>} decode results, Error or type
 */
export function decode<A> (codec: t.Decoder<unknown, A>):(a: unknown) => E.Either<Error, A> {
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
