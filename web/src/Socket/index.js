'use strict'

// Socket for bots connected on topic "rawchat:"

const Ws = use('Ws')
const Logger = use('Logger')

const User = use('App/Models/User')

class Socket {
  constructor (Config) {
    this.Config = Config || {}
    this.socket = () => Ws.getChannel('rawchat:*').topic('rawchat:all')

    this.sockConn = new Map()
  }

  addConnection (socket) {
    this.sockConn.set(socket.id, {
      streamers: []
    })

    this.sendStreamers()
  }

  deleteConnection (socket) {
    this.sockConn.delete(socket.id)

    this.sendStreamers()
  }

  async sendStreamers () {
    const userQuery = await User.query().where('track', true).fetch()
    const streamers = userQuery.toJSON()

    let handledCount = 0
    for (let i = 0; i < streamers.length; i++) {
      const streamer = streamers[i]

      const sockConnKeys = [...this.sockConn.keys()]
      for (let ii = 0; ii < sockConnKeys.length; ii++) {
        const sockConn = this.sockConn.get(sockConnKeys[ii])

        if (sockConn && !sockConn.streamers.includes(streamer.name) && sockConn.streamers.length < 100) {
          handledCount++
          sockConn.streamers.push(streamer.name)
          this.socket().emitTo('message', { newStreamer: streamer }, [sockConnKeys[ii]])
          break
        } else if (sockConn.streamers.includes(streamer.name)) {
          handledCount++
          break
        }
      }
    }

    if (handledCount !== streamers.length) {
      Logger.warning(`[Socket] Not all streamers accounted for. ${streamers.length - handledCount} unhandled streamers. Launch new bot instance!`)
      return Promise.reject(new Error(`${streamers.length - handledCount} unhandled streamers.`))
    }
  }
}

module.exports = Socket
