import * as P from './Peer'
import { pipe, flow } from 'fp-ts/lib/function'
import { SignalData } from 'simple-peer'


export function peerGraphql(wellKnown:string) {
  

  // listen to websocket, pick up a signal

    const peer = pipe(
        wellKnown,
        P.of,
        P.create({initiator:true}),
        P.signal
    )

    const socket = new WebSocket(wellKnown)
    socket.onmessage = flow(
      (data:MessageEvent) => P.map(peer, () => data),
      P.signal
    )
      
  return async (query:unknown) => {
    const result = new Promise((resolve, reject) => {
        P.listen
          ('data')
          (resolve)
          (peer)
    })
    P.send(query)(peer);
    return await result;
  }
}

