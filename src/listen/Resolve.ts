import { graphql as _graphql, ExecutionResult, GraphQLSchema } from 'graphql'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe, flow } from 'fp-ts/lib/function'
import { sign, SignKeyPair } from 'tweetnacl'
import * as Stablelib from '@stablelib/base64'
import graphql from 'babel-plugin-relay/macro'
import { LoadBalance, loadBalance } from './LoadBalance'
import { doSend } from '../websocket'
import { Mutation } from './Mutate'
import {read, write} from '../cache'
import * as E from 'fp-ts/lib/Either'

/**
 * Used to avoid gc for storing peer signature on create
 */
const KeyQuery = graphql`
  query ResolveSecretQuery($hash: String) {
    resolution(hash: $hash) {
      hash
      time
    }
  }
`

/**
 * Retrieve nacl secrets from cache, or create if none exists
 * 
 * @returns {Promise<nacl.SignKeyPair>} 
 */
export async function secret(): Promise<SignKeyPair> {
  const data = await read(`client:Sign.KeyPair`) as { pair: string }
  if (data) {
    const json = JSON.parse(data.pair) as {
      secretKey: string
      publicKey: string
    }
    return {
      secretKey: Stablelib.decode(json.secretKey),
      publicKey: Stablelib.decode(json.publicKey)
    } as SignKeyPair
  } else {
    const pair = sign.keyPair()
    write({
      key:`client:Sign.KeyPair`, 
      type:'Keypair', 
      value:JSON.stringify({
        secretKey: Stablelib.encode(pair.secretKey),
        publicKey: Stablelib.encode(pair.publicKey)
      }), 
      name:'pair', 
      query: KeyQuery,
      variables:{hash:`client:Sign.KeyPair`}
    })
    return pair
  }
}

/**
 * Run a GraphQL query for a LoadBalance request and return results in a Mutation. Schema from codegen in build
 * 
 * @param {GraphQLSchema} schema executable GraphQL schema
 * @param {LoadBalance} load request to query
 * @returns {Promise<Mutation>} resolved graphql query for WebSocket send.
 */
export function query(schema:GraphQLSchema) {
  return flow(
    (load:LoadBalance):[Promise<ExecutionResult>, LoadBalance] => {
      return [_graphql(schema, load.query), load];
    },
    async ([promise, load]:[Promise<ExecutionResult>, LoadBalance]):Promise<Mutation> => {
        return ({
          uri: 'mutate',
          hash: load.hash,
          data: (await promise).data,
        } as Mutation)
      }
    )
  }

/**
 * Add peer signature to Mutation
 * 
 * @param {Promise<Mutation>} mutation Mutation to sign
 * @returns {Promise<Mutation>} Mutation with signature
 */
async function signMutation(mutation:Promise<Mutation>):Promise<Mutation> {
  return Object.assign(await mutation, {signature:sign(Stablelib.decode((await mutation).hash), (await secret())['secretKey'])})
}

/**
 * Send a mutation to imported WebSocket as JSON
 * 
 * @param {Promise<Mutation>} mutation Mutation with resolved GraphQL query to send
 */
export async function send (mutation: Promise<Mutation>): Promise<void> {
  return pipe(await mutation, JSON.stringify, doSend)
}


/**
 * Resolve WebSocket messages requesting GraphQL resolution
 * 
 * @param {GraphQLSchema} schema GraphQL schema resolvers
 * @param {unknown} a WebSocket data payload
 * @returns {TE.TaskEither<Error, Promise<void>>} Side effect which sends message or returns error
 */
export const resolve = (schema:GraphQLSchema) => flow(
  loadBalance,
  TE.chain<Error, LoadBalance, Promise<Mutation>>(flow(query(schema), TE.right)),
  TE.map(signMutation),
  TE.chain<Error, Promise<Mutation>, Promise<void>>(flow(send, TE.right))
)