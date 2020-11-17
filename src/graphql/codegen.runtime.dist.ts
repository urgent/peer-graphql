import * as t from 'io-ts'

export const Query = t.union([
  t.record(
    t.literal('resolution'),
    t.type({
      hash: t.string,
      time: t.string
    })
  ),
  t.record(t.literal('hello'), t.string),
  t.record(t.literal('goodbye'), t.string),
])