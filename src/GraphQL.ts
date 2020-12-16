import { HKT } from 'fp-ts/lib/HKT'
import { pipe, flow } from 'fp-ts/lib/function'
import { graphql, GraphQLSchema, ExecutionResult } from 'graphql';
  
/**
 * @category instances
 * @since 2.5.0
 */
export const URI = 'GraphQL'

/**
 * @category instances
 * @since 2.5.0
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: GraphQL<A>
  }
}

export interface GraphQL<A> {
  _tag: URI,
  value:A,
}

export function query<A>(query:string) {
  return (g:GraphQL<A>): Promise<ExecutionResult<{ [key: string]: any; }, { [key: string]: any; }>> => {
    return graphql(new GraphQLSchema(g.value), query);
  }
}

/**
 * Wrap a value into the type constructor.
 *
 * @category Applicative
 * @since 2.5.0
 */
export function of<A>(a:A):GraphQL<A> {
  return {
    _tag: URI,
    value:a,
  }
}

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.5.0
 */
export function map<A, B>(fa: GraphQL<A>, f: (a: A) => B):GraphQL<B> { 
  const b = {value:f(fa.value)};
  const res = Object.assign({}, fa, b);
  return res
}

/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.5.0 
 */
export function ap<A, B>(fab: GraphQL<(a: A) => B>, fa: GraphQL<A>):GraphQL<B> {
  return chain(fa, flow(fab.value, of))
}

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.5.0
 */
export function chain<A, B>(fa: GraphQL<A>, f: (a:A) => GraphQL<B>):GraphQL<B> {
  return pipe(
    fa.value,
    f
  )
}