
const { loadSchema } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { mergeSchemas } = require('@graphql-tools/merge');
const { printSchema } = require('graphql');

module.exports = {
    plugin: async (schema, documents, config) => {
        const peerGraphqlSchema = await loadSchema(`${__dirname}/../../${process.argv[5]}`, {
            loaders: [
                new GraphQLFileLoader()
            ]
        });
        const merged = mergeSchemas({ schemas: [schema, peerGraphqlSchema] });
        return `import { buildSchema } from 'graphql';\n\nexport default buildSchema(\`${printSchema(merged)}\`)`;
    }
};