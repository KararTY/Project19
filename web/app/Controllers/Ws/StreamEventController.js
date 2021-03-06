'use strict'

class StreamEventController {
  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request
  }

  onMessage (message) {
    // same as: socket.on('message')
  }

  onClose (close) {
    // same as: socket.on('close')
  }

  onError (/* error */) {
    // same as: socket.on('error')
  }
}

module.exports = StreamEventController
