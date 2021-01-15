import * as P from './Peer'
import { pipe } from 'fp-ts/lib/function'
import * as Secret from './secret';
import sp from 'simple-peer'

export async function peerGraphql(websocket:string) {
  
  // public key for peer id
  const secret = await Secret.retrieve();
  
  // WebRTC signaling server
  const socket = new WebSocket(websocket)

  // WebRTC data event listener
  const listen = console.log;

  // WebRTC transport over SimplePeer
  const transport = new sp({initiator:true})
  
  // Listen on WebRTC data, signal, and WebSocket data
  const peer = pipe(
    {secret, socket, listen, transport},
    P.of,
    P.connect,
  )

  return async (query:unknown) => {
    const result = new Promise((resolve, reject) => {
        // update WebRTC listen to resolve current query
        P.map(
          peer, 
          (config:P.Config) => Object.assign({}, config, {listen: resolve})
        )
    })
    P.send(query)(peer);
    return await result;
  }
}

