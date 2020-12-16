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

export interface Peer<A> {
  _tag: URI,
  value:A,
  transport:{
    signal: (data: string | sp.SignalData) => void,
    send: (data: sp.SimplePeerData) => void,
    on: (event:string | symbol, listener:(...args: any[]) => void) => void
  }
}

export function create<A>(o:sp.Options): (p:Peer<A>) => Peer<A> {
  return p => Object.assign({}, p, {transport: new sp(o)});
}

export function signal<A>(peer:Peer<A>): Peer<A> {
  pipe(
    peer.value,
    peer.transport.signal.bind(peer.transport)
  )
  return peer;
}

export function send<A>(data:unknown) {
  return (peer:Peer<A>) => pipe(
    data,
    String,
    peer.transport.send.bind(peer.transport)
  )
}

type listener = (...args: any[]) => void ;

export function listen<A>(event:string | symbol) {
  return (listener:listener) => (_peer:Peer<A>): Peer<A> => {
    const peer = Object.assign({}, _peer);
    peer.transport.on(event, listener);
    return peer;
  }
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
    value:a,
    transport: {
      signal: () => {},
      send: () => {},
      on: () => {}
    },
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
  const b = {value:f(fa.value)};
  const res = Object.assign({}, fa, b);
  return res
}

/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.5.0 
 */
export function ap<A, B>(fab: Peer<(a: A) => B>, fa: Peer<A>):Peer<B> {
  return chain(fa, flow(fab.value, of))
}

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.5.0
 */
export function chain<A, B>(fa: Peer<A>, f: (a:A) => Peer<B>):Peer<B> {
  return pipe(
    fa.value,
    f
  )
}