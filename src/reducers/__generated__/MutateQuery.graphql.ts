/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type MutateQueryVariables = {
    hash?: string | null;
};
export type MutateQueryResponse = {
    readonly response: ReadonlyArray<{
        readonly hash: string | null;
        readonly time: unknown | null;
    } | null> | null;
};
export type MutateQuery = {
    readonly response: MutateQueryResponse;
    readonly variables: MutateQueryVariables;
};



/*
query MutateQuery(
  $hash: String
) {
  response(hash: $hash) {
    hash
    time
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "hash"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "hash",
        "variableName": "hash"
      }
    ],
    "concreteType": "Response",
    "kind": "LinkedField",
    "name": "response",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "hash",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "time",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "MutateQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "MutateQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "da6393e2089316e3806f418a5dcb3cbd",
    "id": null,
    "metadata": {},
    "name": "MutateQuery",
    "operationKind": "query",
    "text": "query MutateQuery(\n  $hash: String\n) {\n  response(hash: $hash) {\n    hash\n    time\n  }\n}\n"
  }
};
})();
(node as any).hash = 'dcb8621709d99fd49328f32923b3d286';
export default node;
