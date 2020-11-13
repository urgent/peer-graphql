import * as t from 'io-ts'

export const Query = t.union([
  t.record(
    t.literal('PeerGraphQLResolution'),
    t.union([
      t.record(t.literal('hash'), t.string),
      t.record(t.literal('time'), t.undefined)
    ])
  )
])