/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type ResolveSecretQueryVariables = {
    hash?: string | null;
};
export type ResolveSecretQueryResponse = {
    readonly PeerGraphQLResolution: ReadonlyArray<{
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
  PeerGraphQLResolution(hash: $hash) {
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
    "concreteType": "PeerGraphQLResolution",
    "kind": "LinkedField",
    "name": "PeerGraphQLResolution",
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
    "cacheID": "f904c35b23b48823bfbd82bbba4082b6",
    "id": null,
    "metadata": {},
    "name": "ResolveSecretQuery",
    "operationKind": "query",
    "text": "query ResolveSecretQuery(\n  $hash: String\n) {\n  PeerGraphQLResolution(hash: $hash) {\n    hash\n    time\n  }\n}\n"
  }
};
})();
(node as any).hash = '451161befb55474353b1a91098bacc22';
export default node;
