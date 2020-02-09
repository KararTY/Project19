'use strict'

const Ws = use('Ws')
const Logger = use('Logger')

const Twitch = use('Service/Twitch')
const Mixer = use('Service/Mixer')
const Logs = use('Service/Logs')
const Db = use('Service/Db')
const Socket = use('Service/Socket')

const StreamEvent = use('App/Models/StreamEvent')

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
      const Platform = twitch ? Twitch : mixer ? Mixer : false
      const messageObject = twitch || mixer

      try {
        let json
        let message

        if (messageObject._type === 'event') {
          json = await Platform.parseEvent(messageObject)
          message = Platform.displayEvent(json)

          const streamEvent = new StreamEvent()
          streamEvent.userid = `${platformName.charAt(0)}-${json.channel.userId}`
          streamEvent.event_name = json.event.type || json.event.currency
          streamEvent.event_value = json.importantValue
          await streamEvent.save()
        } else {
          json = await Platform.parseMessage(messageObject)
          message = Platform.displayMessage(json)
        }

        if (!json.blacklisted) {
          Logger.debug(`[RawChatController] <${platformName.toUpperCase()}> ${messageObject._type || 'message'} received: ${message}`)
          const channel = Ws.getChannel('chat:*').topic(topicString)
          if (channel) channel.broadcast('message', message)
        }

        Logs.queueWrite({ channel: json.channel, platform: json.platform, timestamp: json.timestamp, author: json.author }, message)
        if (json.author.username) Db.queueUser(json)
      } catch (err) {
        Logger.error('[RawChatController] Error')
        console.error(err)
      }
    } else if (twitchOfflineBatch || mixerOfflineBatch) {
      const Platform = twitchOfflineBatch ? Twitch : mixerOfflineBatch ? Mixer : false
      const array = twitchOfflineBatch || mixerOfflineBatch

      Logger.debug(`[RawChatController] ${platformName.toUpperCase()} batch received: ${array.length}`)

      for (let index = 0; index < array.length; index++) {
        const messageObject = array[index]

        try {
          let json
          let message

          if (messageObject._type === 'event') {
            json = await Platform.parseEvent(messageObject)
            message = Platform.displayEvent(json)

            const streamEvent = new StreamEvent()
            streamEvent.userid = `${platformName.charAt(0)}-${json.channel.userId}`
            streamEvent.event_name = json.event.type || json.event.currency
            streamEvent.event_value = json.importantValue
            await streamEvent.save()
          } else {
            json = await Platform.parseMessage(messageObject)
            message = Platform.displayMessage(json)
          }

          if (!json.blacklisted) Logger.debug(`[RawChatController] <${platformName.toUpperCase()}> offline ${messageObject._type || 'message'} received: ${message}`)

          Logs.queueWrite({ channel: json.channel, platform: json.platform, timestamp: json.timestamp, author: json.author }, message)
          if (json.author.username) Db.queueUser(json)
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
