// Identity.ts
import { HKT } from 'fp-ts/lib/HKT'
import { pipe, flow } from 'fp-ts/lib/function'
import sp from 'simple-peer'
import { SignalData } from 'simple-peer';

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

// fp-ts module augmentation for new Peer type
declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Peer<A>
  }
}

/**
 * Represents a peer connection over WebRTC
 */
export interface Peer<A> {
  _tag: URI,
  value: A,
}

/**
 * Represents Peer values required for connect, signal, and send
 */
export type Config = {
  secret: nacl.SignKeyPair,
  socket: WebSocket,
  listen: (a:unknown) => void,
  transport:{
    signal: (data: string | sp.SignalData) => void,
    send: (data: sp.SimplePeerData) => void,
    on: (event:string | symbol, listener:(...args: any[]) => void) => void
  }
}

export const signal = {
  /**
   * Signal local peer with WebSocket event over WebRTC
   *
   * @param {Peer<Config>} peer peer to signal
   * @param {string | sp.SignalData} value value to send to peer as signal data
   * @returns {void}
   */
  in: function (peer:Peer<Config>) {
    return (ev: MessageEvent<any>): void => {
      peer.value.transport.signal.bind(peer.value.transport)(ev.data.signal)
    }
  },

  /**
   * Signal remote peer with WebRTC SignalData over WebSocket
   * @param {Peer<Config>} peer peer with socket to send
   * @param {SignalData} data 
   * @returns {void}
   */
  out: function (peer:Peer<Config>)  {
    return (data:SignalData):void => {
      peer.value.socket.send(JSON.stringify( {
        'signal': String(data),
        'from': peer.value.secret.publicKey
      }))
    }
  }
}

/**
 * Connect over WebRTC with SimplePeer options
 * 
 * @param {sp.Options} o SimplePeer options
 * @param {Peer<Config>} peer Peer to connect with
 * @returns {Peer<Config>} Configured Peer listening on data and signaling
 */
export function connect(peer:Peer<Config>):Peer<Config> {
        // SimplePeer data event
        peer.value.transport.on('data', peer.value.listen)
        // SimplePeer signal event
        peer.value.transport.on('signal', signal.out(peer))
        // Websocket data event to SimplePeer signal
        peer.value.socket.onmessage = signal.in(peer);
        return peer;
}

/**
 * Send data to peer via WebRTC
 * @param {unknown} data Data to send
 * @param {Peer<A>} peer Peer with WebRTC transport
 * @returns void
 */
export function send(data:unknown) {
  return (peer:Peer<Config>) => pipe(
    data,
    String,
    peer.value.transport.send.bind(peer.value.transport)
  )
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
    value: a,
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