import WebSocket, { CloseEvent, ErrorEvent, OpenEvent } from 'isomorphic-ws'

let queue: Array<string> = []

export function create(url:string) {
  const socket = new WebSocket(url)

  socket.onopen = function (evt: OpenEvent) {
    onOpen({socket, evt})
  }
  socket.onclose = function (evt: CloseEvent) {
    onClose(evt)
  }

  socket.onerror = function (evt: ErrorEvent) {
    onError(evt)
  }

  return socket;
};

function onOpen ({socket, evt}:{socket:WebSocket, evt: OpenEvent}) {
  while (queue.length > 0) {
    socket.send(queue.pop())
  }
}

function onClose (evt: CloseEvent) {
  writeToScreen('DISCONNECTED')
}

function onError (evt: ErrorEvent) {
  writeToScreen(evt.message)
}

export function doSend(socket:WebSocket) {
  return (message: string) => {
    if (socket.readyState !== 1) {
      queue = [message, ...queue]
    } else {
      writeToScreen('SENT: ' + message)
      socket.send(message)
    }
  }
}

function writeToScreen (message: string) {
  console.log(message)
}
