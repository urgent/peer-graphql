import * as fc from 'fast-check';
import * as E from 'fp-ts/lib/Either'
import { pipe, identity } from 'fp-ts/lib/function'
import { call } from './peerGraphQL'
import { schema, root } from './graphql/root'

// simple reverse function, for property based testing
function reverse(s) {
    return [...s].reverse().join("");
}

// Websocket message
// Asks peers to resolve a query
const resolution = {
    uri: fc.constant("resolve"),
    hash: fc.hexaString(40, 40),
    query: fc.constant(`query AppHelloQuery {hello}`),
    variables: fc.constant({})
};

// Websocket message
// Answer resolve with mutate
const mutation = {
    uri: fc.constant("mutate"),
    hash: fc.hexaString(40, 40),
    data: fc.constant({ hello: 'world' }),
}

// Run
const fold = (func) => (a) => pipe(
    call(schema, root)({ data: JSON.stringify(a) }),
    E.fold(
        identity,
        func
    )
)

function taskDeconstruct(task) {
    return task;
}

const hash = fold(([, { hash }]) => hash)
const state = fold(([, state]) => state)
const task = fold(taskDeconstruct)

test('let relay then reverse hash be the same as reverse hash then relay', () => {
    fc.assert(
        fc.property(
            fc.record(resolution), fc.record(mutation), (a, b) => {
                const hash1 = reverse(hash(a));
                const hash2 = hash({ ...a, hash: reverse(a.hash) })
                expect(hash1).toEqual(hash2);
                const hash3 = reverse(hash(b));
                const hash4 = hash({ ...b, hash: reverse(b.hash) })
                expect(hash3).toEqual(hash4);
            })
    );
});

test('let state returned from relay({uri:"mutate"}) be the same as deserialized input', () => {
    fc.assert(
        fc.property(
            fc.record(mutation), (a) => {
                expect(state(a)).toEqual(a);
            })
    );
});

test('let relay twice is the same thing as relay once', () => {
    fc.assert(
        fc.property(
            fc.record(resolution), fc.record(mutation), (a, b) => {
                expect(state(a)).toEqual(a);
                expect(state(a)).toEqual(a);
                expect(state(b)).toEqual(b);
                expect(state(b)).toEqual(b);
            })
    );
});

test('let tasks returned from relay({uri:"resolve"}) and relay({uri:"mutation"}) to be function types', () => {
    fc.assert(
        fc.property(
            fc.record(resolution), fc.record(mutation), (a, b) => {
                expect(typeof task(a)[0]).toEqual('function');
                expect(typeof task(b)[0]).toEqual('function');
            })
    );
});