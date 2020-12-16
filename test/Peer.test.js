import * as P from '../src/Peer'
import wrtc from 'wrtc'
import { pipe } from 'fp-ts/lib/function'

test('Peer signals and sends', async (done) => {
    const peer = pipe(
        P.of(),
        P.create({ initiator: true, wrtc }),
        P.listen
            ('signal')
            ((signalData) => pipe(
                P.map(host, () => signalData),
                P.signal,
            )),
        P.listen
            ('connect')
            (() => {
                P.send(JSON.stringify({ test: true }))(peer)
            })
    );

    const host = pipe(
        P.of(),
        P.create({ wrtc }),
        P.listen
            ('signal')
            ((signalData) => pipe(
                P.map(peer, () => signalData),
                P.signal,
            )),
        P.listen
            ('data')
            ((data) => {
                expect(JSON.parse(data)).toEqual({ test: true })
                done()
            })
    );
})
