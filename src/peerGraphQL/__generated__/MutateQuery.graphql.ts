/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type MutateQueryVariables = {
    hash?: string | null;
};
export type MutateQueryResponse = {
    readonly resolution: ReadonlyArray<{
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
  resolution(hash: $hash) {
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
    "concreteType": "Resolution",
    "kind": "LinkedField",
    "name": "resolution",
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
    "cacheID": "c93cbe2041a101002f27b250b7b3e6d6",
    "id": null,
    "metadata": {},
    "name": "MutateQuery",
    "operationKind": "query",
    "text": "query MutateQuery(\n  $hash: String\n) {\n  resolution(hash: $hash) {\n    hash\n    time\n  }\n}\n"
  }
};
})();
(node as any).hash = '66bc37801473b109e543b636b3754b39';
export default node;
