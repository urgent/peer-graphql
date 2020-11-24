import * as fc from 'fast-check';
import { graphql } from 'graphql'
import { schemaWithMocks } from '../graphql/resolvers'
import { query, resolve } from './Resolve'

// need to setup state management
// event emitter for state mutations
import { environment } from '../RelayEnvironment'


const request = {
    uri: fc.constant("resolve"),
    hash: fc.hexaString({ minLength: 40, maxLength: 40 }),
    query: fc.constant(`query AppRepositoryNameQuery {repository(owner: "facebook", name: "relay") {name id}}`),
    variables: fc.constant({}),
};

const socketTransport = new WebSocket(
    'wss://connect.websocket.in/v3/1?apiKey=4sC6D9hsMYg5zcl15Y94nXNz8KAxr8eezGglKE9FkhRLnHcokuKsgCCQKZcW'
)

const socketListen = new WebSocket(
    'wss://connect.websocket.in/v3/1?apiKey=4sC6D9hsMYg5zcl15Y94nXNz8KAxr8eezGglKE9FkhRLnHcokuKsgCCQKZcW'
)

test('let query give a resolve uri', (done) => {
    fc.assert(
        fc.asyncProperty(fc.record(request), async (a) => {
            const query1 = await query(schemaWithMocks)(a)
            expect(query1.uri).toBe("mutate")
            done()
        })
    )
})

test('let query twice be the same data as query once', (done) => {
    fc.assert(
        fc.asyncProperty(fc.record(request), async (a) => {
            const query1 = await query(schemaWithMocks)(a)
            const query2 = await query(schemaWithMocks)(a)
            expect(query1.data.repository.name).toEqual(query2.data.repository.name)
            done()
        })
    )
})

test('let query data.repository.name to be world', (done) => {
    fc.assert(
        fc.asyncProperty(fc.record(request), async (a) => {
            const query1 = await query(schemaWithMocks)(a)
            expect(query1.data.repository.name).toBe('world')
            done()
        })
    )
})

test('let query to give the same data as graphql ', (done) => {
    fc.assert(
        fc.asyncProperty(fc.record(request), async (a) => {
            const query1 = await query(schemaWithMocks)(a)
            const query2 = await graphql(schemaWithMocks, a.query)
            expect(query1.data.repository.name).toEqual(query2.data.repository.name)
            done()
        })
    )
})

test('resolution query works ', async (done) => {
    const query = await graphql(schemaWithMocks, `query ResolutionQuery {resolution{hash,time}}`);
    expect(query.data).toMatchObject({ resolution: [{ hash: 'world', time: null }, { hash: 'world', time: null }] })
    done()
})

test('resolve works ', async (done) => {
    jest.setTimeout(30000)
    const resolution = resolve({ schema: schemaWithMocks, socket: socketTransport })({ uri: 'resolve', hash: '123456', query: `query AppRepositoryNameQuery {repository(owner: "facebook", name: "relay") {name id}}` })
    expect(typeof resolution).toEqual('function')
    socketListen.onmessage = (evt) => {
        const parsed = JSON.parse(evt.data);
        if (parsed.uri === 'mutate' && parsed.hash === '123456') {
            expect(parsed.data.repository.name).toEqual("world");
            done()
        }
        done()
    }
    await resolution();
})