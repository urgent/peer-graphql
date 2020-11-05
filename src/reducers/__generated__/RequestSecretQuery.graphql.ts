/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type RequestSecretQueryVariables = {
    hash?: string | null;
};
export type RequestSecretQueryResponse = {
    readonly response: ReadonlyArray<{
        readonly hash: string | null;
        readonly time: unknown | null;
    } | null> | null;
};
export type RequestSecretQuery = {
    readonly response: RequestSecretQueryResponse;
    readonly variables: RequestSecretQueryVariables;
};



/*
query RequestSecretQuery(
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
    "name": "RequestSecretQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RequestSecretQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "b4e33299df6f54b7caa509d609382869",
    "id": null,
    "metadata": {},
    "name": "RequestSecretQuery",
    "operationKind": "query",
    "text": "query RequestSecretQuery(\n  $hash: String\n) {\n  response(hash: $hash) {\n    hash\n    time\n  }\n}\n"
  }
};
})();
(node as any).hash = '0bc86d39ac1aade2c7093f503a41002b';
export default node;
