import { graphql as _graphql } from 'graphql'
import {
    cache,
    mutate
} from './Mutate'
import { eventEmitter } from '../eventEmitter'
import { socket } from '../websocket'
// need to setup state management
// event emitter in Request for state mutations
import { environment } from '../RelayEnvironment'

const hash = '12345';

const payload = {
    uri: 'mutate',
    hash,
    data: { hello: 'world' }
}

test('mutate works ', async (done) => {
    eventEmitter.once(hash, data => {
        expect(data).toEqual({ data: { hello: 'world' } });
        done()
    })
    const mutation = mutate(payload)
    expect(typeof mutation).toEqual('function')
    await mutation();
})