import * as t from 'io-ts'
import { GraphQLResponseWithData } from 'relay-runtime'
import * as E from 'fp-ts/lib/Either'
import { pipe, identity } from 'fp-ts/lib/function'
import { Query } from './graphql/codegen.runtime.dist'
import { failure } from 'io-ts/lib/PathReporter'

// used when sending and receiving to WebSocket
// like escaping data from data layer

const PayloadData = t.partial({
  data: Query
})

const PayloadError = t.type({
  message: t.string
})

const Location = t.type({
  line: t.number,
  column: t.number
})

const Fault = t.partial({
  locations: t.array(Location),
  severity: t.union([
    t.literal('CRITICAL'),
    t.literal('ERROR'),
    t.literal('WARNING')
  ]) // Not officially part of the spec, but used at Facebook
})

const Meta = t.partial({
  errors: t.intersection([PayloadError, Fault]),
  extensions: t.UnknownRecord,
  label: t.string,
  path: t.union([t.array(t.string), t.array(t.number)])
})

const Runtime = t.intersection([PayloadData, Meta])
type RUN = t.TypeOf<typeof Runtime>

/**
 * WebSocket message to GraphQLResponseWithData
 * @param {any} result runtime data
 * @returns {GraphQLResponseWithData} runtime decoded response with decode errors if any
 */
export const escapeSocket = async ([result]: [Promise<unknown>, void]) =>
  pipe(
    await result,
    Runtime.decode,
    E.fold<t.Errors, RUN, RUN>(
      // format runtime decode error to graphql error
      (errors: t.Errors) => ({
        errors: { message: failure(errors).join('\n'), }
      }),
      identity
    ),
    // cast WebSocket message to GraphQLResponse, as safely as possible because of runtime decode
    (runtime: RUN) => runtime as GraphQLResponseWithData
  )

/**
 * GraphQL operation to WebSocket message
 * @param {any, any} fetch {operation, variables} to format
 * @return {} WebSocket message from graphql operation
 */
export const escapeQL = ({
  operation,
  variables
}: {
  operation: { text: string }
  variables: any
}) => (hash: string) => ({
  uri: 'resolve',
  query: operation.text,
  hash,
  variables
})
