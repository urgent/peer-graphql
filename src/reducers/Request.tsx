import { graphql as _graphql, ExecutionResult } from 'graphql'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import { pipe, flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { decode } from '../peer'
import { doSend } from '../websocket'
import { RES } from './Response'
import { sign, SignKeyPair } from 'tweetnacl'
import {GraphQLSchema} from 'graphql'
import * as Stablelib from '@stablelib/base64'
import {del, read, write} from '../index'
import graphql from 'babel-plugin-relay/macro'

// define types for decode
const Header = t.type({
  uri: t.literal('request'),
  hash: t.string,
  query: t.string,
})

const Body = t.partial({
  variables: t.record(t.string, t.string),
  key: t.string,
  cache: t.string
})

const Request = t.intersection([Header, Body])

export type REQ = t.TypeOf<typeof Request>

const KeyQuery = graphql`
  query RequestSecretQuery($hash: String) {
    response(hash: $hash) {
      hash
      time
    }
  }
`

export function delay (): (
  ma: TE.TaskEither<Error, REQ>
) => TE.TaskEither<Error, REQ> {
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

export function lookup(request:REQ):[REQ, Promise<unknown>] { 
  return [request, read(`client:Response:${request.hash}`)]
}

export function check([request, cache]:[REQ, Promise<unknown>]):TE.TaskEither<Error, REQ> {
    return () => new Promise( (resolve) => {
      cache.then((result) => {
        if(result) {
          del(`client:Response:${request.hash}`);
          resolve(E.left(new Error('Request already fulfilled')));
        } else {
          resolve(E.right(request))
        }
      })
    })
  }

export function query(schema:GraphQLSchema, root:unknown) {
  return async (request: REQ): Promise<RES> => {
    return pipe(
      await _graphql(schema, request.query, root),
      async (result: ExecutionResult) => {
        return ({
          uri: 'response',
          hash: request.hash,
          data: result.data,
          signature: sign(Stablelib.decode(request.hash), (await secret())['secretKey'])
        } as RES)
      }
    )
  }
}

export async function send (response: Promise<RES>): Promise<void> {
  return pipe(await response, JSON.stringify, doSend)
}

export const request = (schema:GraphQLSchema, root:unknown) => flow(
  decode(Request),
  TE.fromEither,
  delay(),
  TE.map(lookup),
  TE.chain(check),
  TE.chain<Error, REQ, Promise<RES>>(flow(query(schema, root), TE.right)),
  TE.chain<Error, Promise<RES>, Promise<void>>(flow(send, TE.right))
)
