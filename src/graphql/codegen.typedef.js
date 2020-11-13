
const { loadSchema } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { mergeTypeDefs } = require('@graphql-tools/merge');
const { print } = require('graphql');

module.exports = {
    plugin: async (schema, documents, config) => {
        const peerGraphqlSchema = await loadSchema(`${__dirname}/../../${process.argv[5]}`, {
            loaders: [
                new GraphQLFileLoader()
            ]
        });
        const merged = mergeTypeDefs([schema, peerGraphqlSchema]);
        return `import { buildSchema } from 'graphql';\n\nexport default buildSchema(\`${print(merged)}\`)`;
    }
};