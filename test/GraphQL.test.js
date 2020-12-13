import * as G from '../src/GraphQL'
import { pipe } from 'fp-ts/lib/function'
import {
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';

test('Peer signals and sends', async (done) => {
    const promise = pipe(
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
        G.query('{hello}')
    )();
    expect((await promise).data.hello).toEqual("world")
    done();
})