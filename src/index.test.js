import { fetch, listenEvent, peerGraphql } from './index'
import { TextEncoder, TextDecoder } from 'util'
import { Crypto } from "@peculiar/webcrypto"
import { eventEmitter } from './eventEmitter'
import { digestMessage } from './listen'
import { resolvers } from './graphql/resolvers'
import { create } from './websocket'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
global.crypto = new Crypto()

const socketListen = new WebSocket(
    'wss://connect.websocket.in/v3/1?apiKey=4sC6D9hsMYg5zcl15Y94nXNz8KAxr8eezGglKE9FkhRLnHcokuKsgCCQKZcW'
)

const socketTransport = create(
    'wss://connect.websocket.in/v3/1?apiKey=4sC6D9hsMYg5zcl15Y94nXNz8KAxr8eezGglKE9FkhRLnHcokuKsgCCQKZcW'
)

// avoid hash collisions
// need unique queries, the argument for the "fetch" function, for each test
// otherwise, one test listens on hash, and receives event emitted by different test

// no websocket listener without peerGraphql function running
// can separate with unique eventEmitter input

afterEach(() => {
    socketListen.onmessage = () => { }
});



test('fetch sends to websocket', async (done) => {
    jest.setTimeout(10000)

    socketListen.onmessage = (evt) => {
        const data = JSON.parse(evt.data);
        // other tests in this file will send messages to socket
        if (data.uri === 'resolve' && data.query === `query IndexSendQuery {hello}`) {
            expect(data.query).toEqual(`query IndexSendQuery {hello}`)
            done();
        }
    }
    // need to handle rejection, not sending back an event to resolve query
    try {
        await fetch(socketTransport)({ text: `query IndexSendQuery {hello}` })
    } catch (e) {
        console.log(e)
    }
})

test('fetch sends to websocket and receives emitted event of hash', async (done) => {
    socketListen.onmessage = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.uri === 'resolve') {
            eventEmitter.emit(data.hash, { data: { hello: 'world' } })
        }
    }
    expect(await fetch(socketTransport)({ text: `query ReceiveQuery {hello}` })).toEqual({ data: { hello: 'world' } })
    done()
})

test('fetch times out', async (done) => {
    expect.assertions(1);
    await expect(fetch(socketTransport)({ text: `query TimeoutQuery {hello}` })).rejects.toEqual(
        new Error('Timeout waiting for peer to resolve query')
    );
    done();
})

test('listenEvent receives event', async (done) => {
    jest.setTimeout(10000)
    expect.assertions(1);
    const operation = { text: `query ListenReceiveQuery {hello}` };
    const hash = await digestMessage(operation.text)
    const res = listenEvent(eventEmitter)(hash);
    eventEmitter.emit(hash, { data: { hello: 'world' } })
    expect(await res).toEqual({ data: { hello: 'world' } });
    done()
})

test('peerGraphql sends to websocket and receives emitted event of hash', async (done) => {
    socketListen.onmessage = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.uri === 'resolve') {
            eventEmitter.emit(data.hash, { data: { hello: 'world' } })
        }
    }
    expect(await peerGraphql({
        schema: resolvers,
        url: 'wss://connect.websocket.in/v3/1?apiKey=4sC6D9hsMYg5zcl15Y94nXNz8KAxr8eezGglKE9FkhRLnHcokuKsgCCQKZcW'
    })({ text: `query PeerGraphQLSendQuery {hello}` })).toEqual({ data: { hello: 'world' } })
    done()
})
