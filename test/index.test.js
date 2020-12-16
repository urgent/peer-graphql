import * as P from '../src/Peer'
import wrtc from 'wrtc'
import { pipe } from 'fp-ts/lib/function'
import * as G from '../src/GraphQL'
import {
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';

const resolvers = G.of({
    query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
            hello: {
                type: GraphQLString,
                resolve() {
                    return 'world';
                },
            },
        },
    }),
});

test('GraphQL runs over WebRTC', async (done) => {
    const peer = pipe(
        P.of(),
        P.create({ initiator: true, wrtc }),
        P.listen
            ('signal')
            ((signalData) => pipe(
                P.map(host, () => signalData),
                P.signal,
            )),
        P.listen
            ('connect')
            (() => {
                P.send("query{ hello }")(peer)
            }),
        P.listen
            ('data')
            ((data) => {
                expect(JSON.parse(data)).toEqual({ data: { "hello": "world" } })
                done()
            }),
    );

    const host = pipe(
        P.of(),
        P.create({ wrtc }),
        P.listen
            ('signal')
            ((signalData) => pipe(
                P.map(peer, () => signalData),
                P.signal
            )),
        P.listen
            ('data')
            ((data) => {
                pipe(
                    resolvers,
                    G.query(String(data)),
                    async (promise) => {
                        const result = await promise
                        if (result.hasOwnProperty('data') && !result.hasOwnProperty('errors')) {
                            P.send(JSON.stringify(result))(host)
                        }
                    }
                );
            })
    )
})