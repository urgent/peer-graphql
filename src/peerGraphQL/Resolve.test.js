import * as fc from 'fast-check';
import { graphql as _graphql } from 'graphql'
import { resolvers } from '../graphql/resolvers'
import { query, resolve } from './Resolve'
import schema from '../graphql/codegen.typedef.dist'

// need to setup state management
// event emitter for state mutations
import { environment } from '../RelayEnvironment'


const request = {
    uri: fc.constant("resolve"),
    hash: fc.hexaString({ minLength: 40, maxLength: 40 }),
    query: fc.constant(`query AppHelloQuery {hello}`),
    variables: fc.constant({}),
};


test('let query give a resolve uri', (done) => {
    fc.assert(
        fc.asyncProperty(fc.record(request), async (a) => {
            const query1 = await query(schema, resolvers)(a)
            expect(query1.uri).toBe("mutate")
            done()
        })
    )
})

test('let query twice be the same data as query once', (done) => {
    fc.assert(
        fc.asyncProperty(fc.record(request), async (a) => {
            const query1 = await query(resolvers)(a)
            const query2 = await query(resolvers)(a)
            expect(query1.data).toMatchObject(query2.data)
            done()
        })
    )
})

test('let query data hello to be world', (done) => {
    fc.assert(
        fc.asyncProperty(fc.record(request), async (a) => {
            const query1 = await query(resolvers)(a)
            expect(query1.data.hello).toBe('world')
            done()
        })
    )
})

test('let query to give the same data as graphql ', (done) => {
    fc.assert(
        fc.asyncProperty(fc.record(request), async (a) => {
            const query1 = await query(resolvers)(a)
            const query2 = await _graphql(schema, a.query, resolvers)
            expect(query1.data).toMatchObject(query2.data)
            done()
        })
    )
})

test('resolution query works ', async (done) => {
    const query = await _graphql(schema, `query ResolutionQuery {resolution{hash,time}}`, resolvers);
    expect(query.data).toMatchObject({ resolution: [{ hash: '123', time: '1234' }] })
    done()
})

export const socketListen = new WebSocket(
    'wss://connect.websocket.in/v3/1?apiKey=4sC6D9hsMYg5zcl15Y94nXNz8KAxr8eezGglKE9FkhRLnHcokuKsgCCQKZcW'
)

test('resolve works ', async (done) => {
    jest.setTimeout(30000)
    const resolution = resolve(schema, `query ResolutionQuery {resolution{hash,time}}`, resolvers)({ uri: 'resolve', hash: '123456', query: `query AppHelloQuery {hello}` })
    expect(typeof resolution).toEqual('function')
    // 1. listen to events, make sure they receive
    // 2. Relay doing something on second call, need units for relay() function
    socketListen.onmessage = (evt) => {
        expect(JSON.parse(evt.data)['data']).toEqual({ "hello": null });
        done()
    }
    await resolution();
})