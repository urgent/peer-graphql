import * as E from 'fp-ts/lib/Either'
import { flow, pipe } from 'fp-ts/lib/function'
import { TaskEither } from 'fp-ts/lib/TaskEither'
import { IOEither } from 'fp-ts/lib/IOEither'
import { resolve } from  './listen/Resolve'
import { mutate } from './listen/Mutate'
import { MessageEvent } from 'ws'
import { GraphQLSchema } from 'graphql'

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

export const call = (schema:GraphQLSchema) => (evt: MessageEvent): Effect =>
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
              return [resolve(schema)(props), props];
              
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
export const listen = (schema:GraphQLSchema) => flow(
  call(schema),
  E.map(([effect]) => {
    return effect()
  })
)


// ---------- Commonly used functions ----------




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
