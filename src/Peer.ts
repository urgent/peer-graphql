// Identity.ts
import { HKT } from 'fp-ts/lib/HKT'
import { pipe, flow } from 'fp-ts/lib/function'
import sp from 'simple-peer'

/**
 * @category instances
 * @since 2.5.0
 */
export const URI = 'Peer'

/**
 * @category instances
 * @since 2.5.0
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Peer<A>
  }
}

type listen = {event:string | symbol, listener:(...args: any[]) => void };

export interface Peer<A> {
  _tag: URI,
  destination:A,
  transport:{
    signal: (data: string | sp.SignalData) => void,
    send: (data: sp.SimplePeerData) => void,
    on: (event:string | symbol, listener:(...args: any[]) => void) => void
  }
}

export function signal<A>(peer:Peer<A>): () => void {
  return () => pipe(
    peer.destination,
    peer.transport.signal
  )
}

export function send<A>(peer:Peer<A>, data:unknown): () => void {
  return () => pipe(
    data,
    String,
    peer.transport.send
  )
}

export function listen<A>(_peer:Peer<A>, {event, listener}:listen): Peer<A> {
    const peer = Object.assign({}, _peer);
    peer.transport.on(event, listener);
    return peer;
}

/**
 * Wrap a value into the type constructor.
 *
 * @category Applicative
 * @since 2.5.0
 */
export function of<A>(a:A):Peer<A> {
  return {
    _tag: URI,
    destination:a,
    transport: new sp({initiator:true}),
    }
  }

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.5.0
 */
export function map<A, B>(fa: Peer<A>, f: (a: A) => B):Peer<B> { 
  return pipe(fa.destination, f, of)
}

/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.5.0 
 */
export function ap<A, B>(fab: Peer<(a: A) => B>, fa: Peer<A>):Peer<B> {
  return chain(fa, flow(fab.destination, of))
}

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.5.0
 */
export function chain<A, B>(fa: Peer<A>, f: (a:A) => Peer<B>):Peer<B> {
  return pipe(
    fa.destination,
    f
  )
}