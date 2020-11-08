import { graphql as _graphql } from 'graphql'
import { schema, root } from '../graphql/resolve'
import { response } from './Response'
import { eventEmitter } from '../eventEmitter'
import { socket } from '../websocket'
// need to setup state management
// event emitter in Request for state mutations
import { environment } from '../RelayEnvironment'

// ignore messages returned from websocket
socket.onmessage = () => { };

const hash = '123';

const payload = {
    uri: 'response',
    hash,
    data: { hello: 'world' }
}

test('response works ', async (done) => {
    eventEmitter.once(hash, data => {
        expect(data).toEqual({ data: { hello: 'world' } });
        done()
    })
    const mutation = response(payload)
    expect(typeof response).toEqual('function')
    await mutation();
})