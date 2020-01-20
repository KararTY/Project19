'use strict'

const User = use('App/Models/User')

const ChannelNotFoundException = use('App/Exceptions/ChannelNotFoundException')

class ChatUpdateController {
  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request

    this.newConnection(socket)
  }

  async newConnection (socket) {
    if (socket.topic) {
      const parsedTopic = socket.topic.match(/:([\w]+)\.([\w]+)/)
      const platform = parsedTopic[1].toUpperCase()
      const channelName = parsedTopic[2].toLowerCase()

      if (platform && channelName) {
        const channelQuery = await User.query().where('name', channelName).where('platform', platform).fetch()
        if (channelQuery.rows.length === 0) {
          const err = new ChannelNotFoundException()
          socket.emit('error', { code: err.code, message: err.message })
          socket.close()
        }
      }
    }
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

module.exports = ChatUpdateController
