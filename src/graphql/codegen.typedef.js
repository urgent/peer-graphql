var GraphQL = require('graphql');
//var merge = require('./merge');

module.exports = {
    plugin: (schema, documents, config) => {
        console.log('args are')
        console.log(process.argv);
        //return `import { buildSchema } from 'graphql';\n\nexport default buildSchema(\`${GraphQL.printSchema(merge(schema))}\`)`;
    }
};