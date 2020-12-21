'use strict'

const fastify = require('fastify')()

function handle(conn) {
    conn.pipe(conn) // creates an echo server
}

fastify.register(require('fastify-websocket'), {
    handle,
    options: { maxPayload: 1048576 }
})

fastify.get('/', { websocket: true }, (connection, req) => {
    connection.socket.on('message', message => {
        // message === 'hi from client'
        connection.socket.send('hi from server')
    })
})

fastify.listen(3000, '0.0.0.0', err => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})