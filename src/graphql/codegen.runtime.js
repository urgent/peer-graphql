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

function transverse(nested) {
    while (nested.hasOwnProperty('type')) {
        nested = nested.type;
    }
    return nested;
}

const lookup = (field) => {
    const nested = transverse(field)
    if (dict.hasOwnProperty(nested.name.value)) {
        return `${field.name.value}: t.${dict[nested.name.value]}`
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
    generateRuntime: (schema) => {
        const reduce = schema.Query.astNode.fields.reduce((acc, field) => {
            const name = field.name.value;
            const nested = transverse(field)
            if (field.type.hasOwnProperty('type')) {
                const fields = schema[nested.name.value].astNode.fields;
                // custom graphql type
                return template({ acc, name, fields })
            }
            const value = field.type.name.value
            //scalar type
            return `${acc}\n  t.record(t.literal('${name}'), t.${dict[value]}),`;
        }, '');

        return `import * as t from 'io-ts'\n\nexport const Query = t.union([${reduce}\n])`;
    }
}