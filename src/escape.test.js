import { escapeSocket, escapeQL } from './escape'

test('escape Websocket message to GraphQL resolution', async (done) => {
    expect(await escapeSocket([{ data: { hello: 'world' } }])).toEqual({ data: { hello: 'world' } });
    expect(await escapeSocket([{ data: { resolution: { hash: 'test123', time: '123' } } }])).toEqual({ data: { resolution: { hash: 'test123', time: '123' } } });
    done();
})

test('escape Websocket catches errors', async (done) => {
    expect(await escapeSocket([{ data: { hello2: 'world' } }])).not.toEqual({ data: { hello: 'world' } });
    done();
})

test('escape QL returns valid message', () => {
    const fetchPayload = {
        operation: { text: `query EscapeQuery {hello}` },
        variables: { input: 'test' }
    };
    expect(
        escapeQL(fetchPayload)('hash123')
    ).toEqual({
        uri: 'resolve',
        query: `query EscapeQuery {hello}`,
        hash: 'hash123',
        variables: { input: 'test' }
    });
})