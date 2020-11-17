const { loadSchema } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { mergeSchemas } = require('@graphql-tools/merge');

const undefinedDefault = 'string';

const dict = {
    'String': 'string',
    'Int': 'number',
    'Float': 'number',
    'Boolean': 'boolean',
    'id': 'string',
}

const lookup = (field) => {
    if (dict.hasOwnProperty(field.type.name.value)) {
        return `${field.name.value}: t.${dict[field.type.name.value]}`
    }
    else {
        return `${field.name.value}: t.${undefinedDefault}`
    }
}


const format = (fields) => fields.map(lookup).join(`,
      `)


const template = ({ acc, name, fields }) =>
    `${acc}
  t.record(
    t.literal('${name}'),
    t.type({
      ${format(fields)}
    })
  ),`


module.exports = {
    plugin: async (schema, documents, config) => {

        const peerGraphqlSchema = await loadSchema(`${__dirname}/../../${process.argv[5]}`, {
            loaders: [
                new GraphQLFileLoader()
            ]
        });
        const merged = await mergeSchemas({ schemas: [schema, peerGraphqlSchema] });

        const typesMap = merged.getTypeMap();

        const reduce = typesMap.Query.astNode.fields.reduce((acc, field) => {
            const name = field.name.value;
            if (field.type.hasOwnProperty('type')) {
                const fields = typesMap[field.type.type.name.value].astNode.fields;
                // custom graphql type
                return template({ acc, name, fields })
            }
            const value = field.type.name.value
            //scalar type
            return `${acc}\n  t.record(t.literal('${name}'), t.${dict[value]}),`;
        }, '');

        return `import * as t from 'io-ts'\n\nexport const Query = t.union([${reduce}\n])`
            ;
    }
};