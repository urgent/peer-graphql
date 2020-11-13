import { graphql as _graphql, ExecutionResult } from 'graphql'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe, flow } from 'fp-ts/lib/function'
import { sign, SignKeyPair } from 'tweetnacl'
import * as Stablelib from '@stablelib/base64'
import graphql from 'babel-plugin-relay/macro'
import { Request, validate } from './Request'
import { doSend } from '../websocket'
import { Mutation } from './Mutate'
import {read, write} from '../cache'
import schema from '../graphql/codegen.typedef.dist'

export interface Resolution {
  uri:'resolve',
  hash:string,
  query:string,
  variables?:{ [x: string]: string; } | undefined,
  signature: Uint8Array
}

const KeyQuery = graphql`
  query ResolveSecretQuery($hash: String) {
    PeerGraphQLResolution(hash: $hash) {
      hash
      time
    }
  }
`

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

async function cast(promise:Request):Promise<Resolution> {
  return pipe(
    await promise,
    async (request:Request) => Object.assign(request, {signature:sign(Stablelib.decode(request.hash), (await secret())['secretKey'])})
  )
}

export function query(resolvers:unknown) {
  return async (promise: Promise<Resolution>): Promise<Mutation> => {
    return pipe(
      await promise,
      (resolution:Resolution):[Promise<ExecutionResult>, Resolution] => {
        return [_graphql(schema, resolution.query, resolvers), resolution]
      },
      async ([promise, resolution]:[Promise<ExecutionResult>, Resolution]) => {
        return ({
          uri: 'mutate',
          hash: resolution.hash,
          data: (await promise).data,
          signature: resolution.signature
        } as Mutation)
      }
    )
  }
}

export async function send (resolution: Promise<Mutation>): Promise<void> {
  return pipe(await resolution, JSON.stringify, doSend)
}



export const resolve = (resolvers:unknown) => flow(
  validate,
  TE.map(cast),
  TE.chain<Error, Promise<Resolution>, Promise<Mutation>>(flow(query(resolvers), TE.right)),
  TE.chain<Error, Promise<Mutation>, Promise<void>>(flow(send, TE.right))
)
