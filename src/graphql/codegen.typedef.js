import GraphQL from 'graphql';
import { merge } from './merge';

module.exports = {
    plugin: (schema, documents, config) => {

        return `import { buildSchema } from 'graphql';\n\nexport default buildSchema(\`${GraphQL.printSchema(merge(schema))}\`)`;
    }
};