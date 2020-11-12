// The root provides a resolver function for each API endpoint
export const resolvers = {
  hello: () => {
    return 'world'
  },
  resolution: (args: unknown) => {
    return [
      {
        hash: '123',
        time: '1234'
      }
    ]
  }
}
