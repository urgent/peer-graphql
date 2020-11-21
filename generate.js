#! /usr/bin/env node

'use strict';

const { loadSchema } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { mergeSchemas } = require('@graphql-tools/merge');
const { printSchema } = require('graphql');
const { generateRuntime } = require('./src/graphql/codegen.runtime');
const fs = require('fs');

async function run(schema, documents, config) {
    const peerGraphqlSchema = await loadSchema(`${__dirname}/schema.peergraphql.graphql`, {
        loaders: [
            new GraphQLFileLoader()
        ]
    });

    const projectSchema = await loadSchema(process.argv[2], {
        loaders: [
            new GraphQLFileLoader()
        ]
    });

    const merged = mergeSchemas({ schemas: [projectSchema, peerGraphqlSchema] });
    fs.writeFile(`./peergraphql.merged.schema.graphql`, printSchema(merged), () => {
        console.log(`Wrote ./peergraphql.merged.schema.graphql`);
    });
    //typedefs
    const typedefs = `import { buildSchema } from 'graphql';\n\nexport const schemaString = \`${printSchema(merged)}\`\n\nexport default buildSchema(schemaString)`
    fs.writeFile(`${__dirname}/lib/graphql/codegen.typedefs.dist.ts`, typedefs, () => {
        console.log(`Wrote ${__dirname}/lib/graphql/codegen.typedefs.dist.ts`);
    });
    //runtime
    const runtime = generateRuntime(merged.getTypeMap())
    fs.writeFile(`${__dirname}/lib/graphql/codegen.runtime.dist.ts`, runtime, () => {
        console.log(`Wrote ${__dirname}/lib/graphql/codegen.runtime.dist.ts`);
    });
    return;
};
run()