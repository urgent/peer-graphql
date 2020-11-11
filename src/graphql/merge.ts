const { loadSchema } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { mergeTypeDefs } = require('@graphql-tools/merge');

export async function merge(src:string) {
  const peerGraphqlSchema = await loadSchema('./schema.graphql', {
    loaders: [
      new GraphQLFileLoader()
    ]
  });

  const projectSchema = await loadSchema(src, {
    loaders: [
      new GraphQLFileLoader()
    ]
  });

  return mergeTypeDefs([projectSchema, peerGraphqlSchema])
}