import * as IOE from 'fp-ts/lib/IOEither'
import { flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { decode } from '../peerGraphQL'
import { EventEmitter } from 'events'
import { eventEmitter } from '../eventEmitter'
import graphql from 'babel-plugin-relay/macro'
import {read, write } from '../cache'

const Mutation = t.type({
  uri: t.literal('mutate'),
  hash: t.string,
  data: t.unknown
})

export type Mutation = t.TypeOf<typeof Mutation>

const MutateQuery = graphql`
  query MutateQuery($hash: String) {
    PeerGraphQLResolution(hash: $hash) {
      hash
      time
    }
  }
`

export async function cache (mutation: Mutation): Promise<Mutation> {  
  if(!(await read(`client:Resolution:${mutation.hash}`))) {
    write({
      key:`client:Resolution:${mutation.hash}`, 
      type:'Resolution', 
      query: MutateQuery,
      variables:{hash:mutation.hash}
    })
  }  
  return mutation
}

function emit (eventEmitter: EventEmitter) {
  return async (mutation: Promise<Mutation>) =>{
    eventEmitter.emit((await mutation).hash, { data: (await mutation).data })
  }
}

export const mutate = flow(
  decode(Mutation),
  IOE.fromEither,
  IOE.chain<Error, Mutation, Promise<Mutation>>(flow(cache, IOE.right)),
  IOE.map<Promise<Mutation>, void>(emit(eventEmitter)),
)
