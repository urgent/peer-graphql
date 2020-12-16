import * as P from './Peer'
import { pipe } from 'fp-ts/lib/function'
import { SignalData } from 'simple-peer'


export function peerGraphql(wellKnown:SignalData) {
  
    const peer = pipe(
        wellKnown,
        P.of,
        P.create({}),
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

