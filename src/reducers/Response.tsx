import * as IOE from 'fp-ts/lib/IOEither'
import { flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { decode } from '../peer'
import { EventEmitter } from 'events'
import { eventEmitter } from '../eventEmitter'
import graphql from 'babel-plugin-relay/macro'
import {read, write } from '../index'

const Response = t.type({
  uri: t.literal('response'),
  hash: t.string,
  data: t.unknown
})

export type RES = t.TypeOf<typeof Response>

const ResponseQuery = graphql`
  query ResponseQuery($hash: String) {
    response(hash: $hash) {
      hash
      time
    }
  }
`

export async function cache (request: RES): Promise<RES> {  
  if(!(await read(`client:Response:${request.hash}`))) {
    write({
      key:`client:Response:${request.hash}`, 
      type:'Response', 
      query: ResponseQuery,
      variables:{hash:request.hash}
    })
  }
  return request
}

function emit (eventEmitter: EventEmitter) {
  return async (response: Promise<RES>) =>{
    eventEmitter.emit((await response).hash, { data: (await response).data })
  }
}

export const response = flow(
  decode(Response),  
  IOE.fromEither,
  IOE.chain<Error, RES, Promise<RES>>(flow(cache, IOE.right)),
  IOE.map<Promise<RES>, void>(emit(eventEmitter))
)
