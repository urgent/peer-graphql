import * as fc from 'fast-check';
import { graphql as _graphql } from 'graphql'
import { schema, root } from '../graphql/resolve'
import { query, request } from './Request'
import { socket } from '../websocket'
// need to setup state management
// event emitter in Request for state mutations
import { environment } from '../RelayEnvironment'


const payload = {
    uri: fc.constant("request"),
    hash: fc.hexaString(40, 40),
    query: fc.constant(`query AppHelloQuery {hello}`),
    variables: fc.constant({})
};

test('let query give a response uri', (done) => {
    fc.assert(
        fc.asyncProperty(fc.record(payload), async (a) => {
            const query1 = await query(schema, root)(a)
            expect(query1.uri).toBe("response")
            done()
        })
    )
})

test('let query twice be the same data as query once', (done) => {
    fc.assert(
        fc.asyncProperty(fc.record(payload), async (a) => {
            const query1 = await query(schema, root)(a)
            const query2 = await query(schema, root)(a)
            expect(query1.data).toMatchObject(query2.data)
            done()
        })
    )
})

test('let query data hello to be world', (done) => {
    fc.assert(
        fc.asyncProperty(fc.record(payload), async (a) => {
            const query1 = await query(schema, root)(a)
            expect(query1.data.hello).toBe('world')
            done()
        })
    )
})

test('let query to give the same data as graphql ', (done) => {
    fc.assert(
        fc.asyncProperty(fc.record(payload), async (a) => {
            const query1 = await query(schema, root)(a)
            const query2 = await _graphql(schema, a.query, root)
            expect(query1.data).toMatchObject(query2.data)
            done()
        })
    )
})

test('request query works ', async (done) => {
    const query = await _graphql(schema, `query ResponseQuery {response{hash,time}}`, root);
    expect(query.data).toMatchObject({ response: [{ hash: '123', time: '1234' }] })
    done()
})

export const socketListen = new WebSocket(
    'wss://connect.websocket.in/v3/1?apiKey=4sC6D9hsMYg5zcl15Y94nXNz8KAxr8eezGglKE9FkhRLnHcokuKsgCCQKZcW'
)

test('request works ', async (done) => {
    jest.setTimeout(10000)
    const response = request(schema, `query ResponseQuery {response{hash,time}}`, root)({ uri: 'request', hash: '123', query: `query AppHelloQuery {hello}` })
    expect(typeof response).toEqual('function')
    // 1. listen to events, make sure they receive
    // 2. Relay doing something on second call, need units for relay() function
    socketListen.onmessage = (evt) => {
        console.log(evt.data);
        done()
    }
    await response();
})