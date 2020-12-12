import * as P from '../src/Peer'
import wrtc from 'wrtc'
import { pipe } from 'fp-ts/lib/function'

test('Peer signals and sends', async (done) => {
    jest.setTimeout(30000)
    expect.assertions(1);

    // want to concat, transverse, and sequence peers for management.

    const peer = pipe(
        P.of(),
        P.create({ initiator: true, wrtc }),
        P.listen({
            event: 'signal',
            listener: (signalData) => {
                P.signal(P.map(host, () => signalData))()
            }
        }),
        P.listen({
            event: 'connect',
            listener: () => {
                P.send(peer, JSON.stringify({ test: true }))()
            }
        })
    );
    const host = pipe(
        P.of(),
        P.create({ wrtc }),
        P.listen({
            event: 'signal',
            listener: (signalData) => {
                P.signal(P.map(peer, () => signalData))()
            }
        }),
        P.listen({
            event: 'data',
            listener: (data) => {
                expect(JSON.parse(data)).toEqual({ test: true })
                done()
            }
        })
    )
})
