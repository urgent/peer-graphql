/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type secretQueryVariables = {
    hash?: string | null;
};
export type secretQueryResponse = {
    readonly resolution: ReadonlyArray<{
        readonly hash: string | null;
        readonly time: unknown | null;
    } | null> | null;
};
export type secretQuery = {
    readonly response: secretQueryResponse;
    readonly variables: secretQueryVariables;
};



/*
query secretQuery(
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
    "name": "secretQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "secretQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d777c0cb5b9e6eb4e54ebc587fa207db",
    "id": null,
    "metadata": {},
    "name": "secretQuery",
    "operationKind": "query",
    "text": "query secretQuery(\n  $hash: String\n) {\n  resolution(hash: $hash) {\n    hash\n    time\n  }\n}\n"
  }
};
})();
(node as any).hash = '0896c41097341ad3f419e670b46fe6e1';
export default node;
