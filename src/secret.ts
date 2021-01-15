import { sign, SignKeyPair } from 'tweetnacl'
import * as Stablelib from '@stablelib/base64'
import { read, write } from './cache'
import graphql from 'babel-plugin-relay/macro'

/**
 * Used to avoid gc for storing peer signature on create
 */
const KeyQuery = graphql`
  query ResolveSecretQuery($hash: String) {
    resolution(hash: $hash) {
      hash
      time
    }
  }
`

/**
 * Retrieve nacl secrets from cache, or create if none exists
 * 
 * @returns {Promise<nacl.SignKeyPair>} 
 */
export async function retrieve(): Promise<SignKeyPair> {
    const data = await read(`client:Sign.KeyPair`) as { pair: string }
    if (data) {
      const json = JSON.parse(data.pair) as {
        secretKey: string
        publicKey: string
      }
      return {
        secretKey: Stablelib.decode(json.secretKey),
        publicKey: Stablelib.decode(json.publicKey)
      } as SignKeyPair
    } else {
      const pair = sign.keyPair()
      write({
        key:`client:Sign.KeyPair`, 
        type:'Keypair', 
        value:JSON.stringify({
          secretKey: Stablelib.encode(pair.secretKey),
          publicKey: Stablelib.encode(pair.publicKey)
        }), 
        name:'pair', 
        query: KeyQuery,
        variables:{hash:`client:Sign.KeyPair`}
      })
      return pair
    }
  }
  