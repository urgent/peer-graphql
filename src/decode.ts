import * as t from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'
import * as E from 'fp-ts/lib/Either'
import { flow } from 'fp-ts/lib/function'

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