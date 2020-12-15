import * as P from '../src/Peer'
import wrtc from 'wrtc'
import { pipe } from 'fp-ts/lib/function'
import * as G from '../src/GraphQL'
import {
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';

test('GraphQL runs over WebRTC', async (done) => {
    jest.setTimeout(5000)
    expect.assertions(1);



    const peer = pipe(
        P.of(),
        P.create({ initiator: true, wrtc }),
        P.listen({
            event: 'signal',
            listener: (signalData) => {
                P.signal(P.map(host, () => signalData))()
            }
        }),
        P.listen({
            event: 'connect',
            listener: () => {
                P.send(peer, "query{ hello }")()
            }
        }),
        P.listen({
            event: 'data',
            listener: (data) => {
                expect(JSON.parse(data)).toEqual({ data: { "hello": "world" } })
                done()
            }
        }),
        P.listen({
            event: 'close',
            listener: () => {
                console.log('close')
            }
        })
    );

    const host = pipe(
        P.of(),
        P.create({ wrtc }),
        P.listen({
            event: 'signal',
            listener: (signalData) => {
                P.signal(P.map(peer, () => signalData))()
            }
        }),
        P.listen({
            event: 'data',
            listener: (data) => {
                pipe(
                    pipe(
                        G.of({
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
                        }),
                        G.query(String(data))
                    )(),
                    async (promise) => {
                        const result = await promise
                        if (result.hasOwnProperty('data') && !result.hasOwnProperty('errors')) {
                            P.send(host, JSON.stringify(result))()
                        }
                    }
                );
            }
        })
    )
})