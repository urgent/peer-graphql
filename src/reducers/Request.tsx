import { graphql as _graphql, ExecutionResult } from 'graphql'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import { pipe, flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { decode } from '../peer'
import { schema, root } from '../graphql/resolve'
import { doSend } from '../websocket'
import { Reducer } from '../reducer'
import { RES } from './Response'
import { sign, SignKeyPair } from 'tweetnacl'
import * as Stablelib from '@stablelib/base64'
import {read, write, del} from '../index'
import graphql from 'babel-plugin-relay/macro'

// define types for decode
const Request = t.type({
  uri: t.literal('request'),
  hash: t.string,
  query: t.string,
  variables: t.record(t.string, t.string)
})

export type REQ = t.TypeOf<typeof Request>

const KeyQuery = graphql`
  query RequestQuerySecret($hash: String) {
    response(hash: $hash) {
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
      query: KeyQuery
    })
    return pair
  }
}

export async function query (request: Promise<REQ>): Promise<RES> {
  return pipe(
    await _graphql(schema, (await request).query, root),
    async (result: ExecutionResult) =>
      ({
        uri: 'response',
        hash: (await request).hash,
        data: result.data,
        signature: sign(Stablelib.decode((await request).hash), (await secret())['secretKey'])
      } as RES)
  )
}

export async function send (response: Promise<RES>): Promise<void> {
  return pipe(await response, JSON.stringify, doSend)
}

//extend interface
declare module '../reducer' {
  export interface Reducer {
    request: (i: { delay: number }) => TE.TaskEither<Error, Promise<void>>
  }

  export interface URI2Type {
    request: REQ
  }
}

function delay (): (
  ma: TE.TaskEither<Error, REQ>
) => TE.TaskEither<Error, REQ> {
  return ma => () =>
    new Promise(resolve => {
      setTimeout(() => {
        ma().then(resolve)
      }, (Math.floor(Math.random() * 30) + 1) * 20)
    })
}

function check (): (
  ma: TE.TaskEither<Error, REQ>
) => TE.TaskEither<Error, Promise<REQ>> {
  return ma => () =>
    new Promise( async(resolve) => {
      ma().then(flow(
        E.fold(
          async error => E.left(error),
          async (request:REQ) => {
            if(await read(`client:Response:${request.hash}`)) {
              return E.right(request)
            } else {
              return E.left(new Error('Request already fulfilled'))
            }
          }
        )
      ),
      resolve)    
    })
}

Reducer.prototype.request = flow(
  decode(Request),
  TE.fromEither,
  TE.mapLeft(err => new Error(String(err))),
  delay(),
  check(),
  TE.chain<Error, Promise<REQ>, Promise<RES>>(flow(query, TE.right)),
  TE.chain<Error, Promise<RES>, Promise<void>>(flow(send, TE.right))
)
