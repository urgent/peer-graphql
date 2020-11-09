/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type ResolveSecretQueryVariables = {
    hash?: string | null;
};
export type ResolveSecretQueryResponse = {
    readonly response: ReadonlyArray<{
        readonly hash: string | null;
        readonly time: unknown | null;
    } | null> | null;
};
export type ResolveSecretQuery = {
    readonly response: ResolveSecretQueryResponse;
    readonly variables: ResolveSecretQueryVariables;
};



/*
query ResolveSecretQuery(
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
    "name": "ResolveSecretQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResolveSecretQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "154ffdf539021e1752cc72ad7d38380a",
    "id": null,
    "metadata": {},
    "name": "ResolveSecretQuery",
    "operationKind": "query",
    "text": "query ResolveSecretQuery(\n  $hash: String\n) {\n  response(hash: $hash) {\n    hash\n    time\n  }\n}\n"
  }
};
})();
(node as any).hash = '98bafcc6251504d5fe068d351fa1b243';
export default node;
