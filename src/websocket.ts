import WebSocket, { CloseEvent, ErrorEvent, OpenEvent } from 'isomorphic-ws'

export const socket = new WebSocket(
  'wss://connect.websocket.in/v3/1?apiKey=4sC6D9hsMYg5zcl15Y94nXNz8KAxr8eezGglKE9FkhRLnHcokuKsgCCQKZcW'
)

let queue: Array<string> = []

socket.onopen = function (evt: OpenEvent) {
  onOpen(evt)
}
socket.onclose = function (evt: CloseEvent) {
  onClose(evt)
}

socket.onerror = function (evt: ErrorEvent) {
  onError(evt)
}

function onOpen (evt: OpenEvent) {
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

export function doSend (message: string) {
  if (socket.readyState !== 1) {
    queue = [message, ...queue]
  } else {
    writeToScreen('SENT: ' + message)
    socket.send(message)
  }
}

function writeToScreen (message: string) {
  console.log(message)
}
