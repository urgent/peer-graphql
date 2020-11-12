import { loadSchema } from '@graphql-tools/load';
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
import { merge } from './merge'
test('merge does not throw ', async (done) => {
    // merge only used in codegen, provides schema
    const projectGraphqlSchema = await loadSchema(`${__dirname}/../../schema.project.graphql`, {
        loaders: [
            new GraphQLFileLoader()
        ]
    });
    await merge(projectGraphqlSchema);
    done();
})