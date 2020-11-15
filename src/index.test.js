import { fetch } from './index'
import { TextEncoder, TextDecoder } from 'util'
import { Crypto } from "@peculiar/webcrypto"
import { eventEmitter } from './eventEmitter'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
global.crypto = new Crypto()

const socketListen = new WebSocket(
    'wss://connect.websocket.in/v3/1?apiKey=4sC6D9hsMYg5zcl15Y94nXNz8KAxr8eezGglKE9FkhRLnHcokuKsgCCQKZcW'
)

const operation = { text: `query AppHelloQuery {hello}` };

test('fetch sends to websocket', async (done) => {
    fetch(operation)
    socketListen.onmessage = (evt) => {
        const data = JSON.parse(evt.data);
        // other tests in this file will send messages to socket
        if (data.uri === 'resolve') {
            expect(data.query).toEqual(operation.text)
            done();
        }
    }
})

test('fetch sends to websocket and responds to emitted event of hash', async (done) => {
    jest.setTimeout(30000)
    socketListen.onmessage = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.uri === 'resolve') {
            eventEmitter.emit(data.hash, { data: { hello: 'world' } })
        }
    }
    expect(await fetch(operation)).toEqual({ data: { hello: 'world' } })
    done()
})

// listen event times out

// listen event receives websocket

// peerGraphql listens

// peerGraphql sends
