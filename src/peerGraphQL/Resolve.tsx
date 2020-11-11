import { graphql as _graphql, ExecutionResult, GraphQLSchema } from 'graphql'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import { pipe, flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { sign, SignKeyPair } from 'tweetnacl'
import * as Stablelib from '@stablelib/base64'
import graphql from 'babel-plugin-relay/macro'
import { decode } from '../peerGraphQL'
import { doSend } from '../websocket'
import { Mutation } from './Mutate'
import {del, read, write} from '../cache'


// define types for decode
const Header = t.type({
  uri: t.literal('resolve'),
  hash: t.string,
  query: t.string,
})

const Body = t.partial({
  variables: t.record(t.string, t.string),
  key: t.string,
  cache: t.string
})

const Resolution = t.intersection([Header, Body])

export type Resolution = t.TypeOf<typeof Resolution>

const KeyQuery = graphql`
  query ResolveSecretQuery($hash: String) {
    PeerGraphQLResolution(hash: $hash) {
      hash
      time
    }
  }
`

export function delay (): (
  ma: TE.TaskEither<Error, Resolution>
) => TE.TaskEither<Error, Resolution> {
  return ma => () =>
    new Promise(resolve => {
      setTimeout(() => {
        ma().then(resolve)
      }, (Math.floor(Math.random() * 30) + 1) * 20)
    })
}

export async function secret (): Promise<SignKeyPair> {
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

export function lookup(resolution:Resolution):[Resolution, Promise<unknown>] { 
  return [resolution, read(`client:Resolution:${resolution.hash}`)]
}

export function check([resolve, cache]:[Resolution, Promise<unknown>]):TE.TaskEither<Error, Resolution> {
    return () => new Promise( (_resolve) => {
      cache.then((result) => {
        if(result) {
          del(`client:Resolution:${resolve.hash}`);
          _resolve(E.left(new Error('Message already resolved')));
        } else {
          _resolve(E.right(resolve))
        }
      })
    })
  }

export function query(schema:GraphQLSchema, root:unknown) {
  return async (resolve: Resolution): Promise<Mutation> => {
    return pipe(
      await _graphql(schema, resolve.query, root),
      async (result: ExecutionResult) => {
        return ({
          uri: 'mutate',
          hash: resolve.hash,
          data: result.data,
          signature: sign(Stablelib.decode(resolve.hash), (await secret())['secretKey'])
        } as Mutation)
      }
    )
  }
}

export async function send (resolution: Promise<Mutation>): Promise<void> {
  return pipe(await resolution, JSON.stringify, doSend)
}

export const resolve = (schema:GraphQLSchema, root:unknown) => flow(
  decode(Resolution),
  TE.fromEither,
  delay(),
  TE.map(lookup),
  TE.chain(check),
  TE.chain<Error, Resolution, Promise<Mutation>>(flow(query(schema, root), TE.right)),
  TE.chain<Error, Promise<Mutation>, Promise<void>>(flow(send, TE.right))
)
