'use strict'

const Ws = use('Ws')
const Logger = use('Logger')

const Twitch = use('Service/Twitch')
const Mixer = use('Service/Mixer')
const Logs = use('Service/Logs')
const Db = use('Service/Db')
const Socket = use('Service/Socket')

class RawChatController {
  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request

    Socket.addConnection(socket)

    // Logger.debug('%j', { socket, request })
  }

  async onMessage ({ twitch, twitchOfflineBatch, mixer, mixerOfflineBatch }) {
    const platformName = (twitch || twitchOfflineBatch) ? 'twitch' : (mixer || mixerOfflineBatch) ? 'mixer' : false

    if (twitch || mixer) {
      const topicString = `chat:${platformName}.${twitch ? twitch.channelName : mixer.token}`
      const PlatformMessage = twitch ? Twitch : mixer ? Mixer : false
      const messageObject = twitch || mixer

      try {
        const json = await PlatformMessage.parseMessage(messageObject)
        const message = PlatformMessage.displayMessage(json)

        if (!json.blacklisted) {
          Logger.debug(`[RawChatController] <${platformName.toUpperCase()}> message received: ${message}`)
          const channel = Ws.getChannel('chat:*').topic(topicString)
          if (channel) channel.broadcast('message', message)
        }

        Logs.queueWrite({ channel: json.channel, platform: json.platform, timestamp: json.timestamp, author: json.author }, message)
        Db.queueUser(json)
      } catch (err) {
        Logger.error('[RawChatController] Error')
        console.error(err)
      }
    } else if (twitchOfflineBatch || mixerOfflineBatch) {
      const PlatformMessage = twitchOfflineBatch ? Twitch : mixerOfflineBatch ? Mixer : false
      const array = twitchOfflineBatch || mixerOfflineBatch

      Logger.debug(`[RawChatController] ${platformName.toUpperCase()} messages batch received: ${array.length}`)

      for (let index = 0; index < array.length; index++) {
        try {
          const json = await PlatformMessage.parseMessage(array[index])
          const message = PlatformMessage.displayMessage(json)

          if (!json.blacklisted) Logger.debug(`[RawChatController] <${platformName.toUpperCase()}> offline message received: ${message}`)

          Logs.queueWrite({ channel: json.channel, platform: json.platform, timestamp: json.timestamp, author: json.author }, message)
          Db.queueUser(json)
        } catch (err) {
          Logger.error('[RawChatController] Error')
          console.error(err)
        }
      }
    }

    // same as: socket.on('message')
  }

  onClose (close) {
    Logger.debug('[RawChatController] "close":\n%j', close)
    Socket.deleteConnection(this.socket)

    // same as: socket.on('close')
  }

  onError (error) {
    Logger.error('[RawChatController] "error":\n%j', error)
    // same as: socket.on('error')
  }
}

module.exports = RawChatController
