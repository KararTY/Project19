'use strict'

const Ws = use('Ws')
const Logger = use('Logger')

const Twitch = use('Service/Twitch')
const Mixer = use('Service/Mixer')
const Logs = use('Service/Logs')
const Db = use('Service/Db')

const StreamEvent = use('App/Models/StreamEvent')

class RawStreamEventController {
  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request

    // Logger.debug('%j', { socket, request })
  }

  async onMessage ({ twitch, twitchOfflineBatch, mixer, mixerOfflineBatch }) {
    const platformName = (twitch || twitchOfflineBatch) ? 'twitch' : (mixer || mixerOfflineBatch) ? 'mixer' : false

    if (twitch || mixer) {
      const topicString = `chat:${platformName}.${twitch ? twitch.channelName : mixer.token}`
      const PlatformEvent = twitch ? Twitch : mixer ? Mixer : false
      const eventObject = twitch || mixer

      /**
       * Event {
       *  name: string, len 32
       *  value: string, len 64
       * }
       */
      try {
        const json = await PlatformEvent.parseEvent(eventObject)
        const message = PlatformEvent.displayEvent(json)

        if (!json.blacklisted) {
          Logger.debug(`[RawStreamEventController] <${platformName.toUpperCase()}> event received: ${message}`)
          const channel = Ws.getChannel('chat:*').topic(topicString)
          if (channel) channel.broadcast('message', message)
        }

        Logs.queueWrite({ channel: json.channel, platform: json.platform, timestamp: json.timestamp, author: json.author }, message)
        if (json.author.username) Db.queueUser(json)

        const streamEvent = new StreamEvent()
        streamEvent.userid = `${platformName.charAt(0)}-${json.channel.userId}`
        streamEvent.event_name = json.event.type || json.event.currency
        streamEvent.event_value = json.importantValue
        await streamEvent.save()
      } catch (err) {
        Logger.error('[RawStreamEventController] Error')
        console.error(err)
      }
    } else if (twitchOfflineBatch || mixerOfflineBatch) {
      const PlatformEvent = twitchOfflineBatch ? Twitch : mixerOfflineBatch ? Mixer : false
      const array = twitchOfflineBatch || mixerOfflineBatch

      Logger.debug(`[RawStreamEventController] ${platformName.toUpperCase()} events batch received: ${array.length}`)

      for (let index = 0; index < array.length; index++) {
        try {
          const json = await PlatformEvent.parseEvent(array[index])
          const message = PlatformEvent.displayEvent(json)

          if (!json.blacklisted) Logger.debug(`[RawStreamEventController] <${platformName.toUpperCase()}> offline event received: ${message}`)

          Logs.queueWrite({ channel: json.channel, platform: json.platform, timestamp: json.timestamp, author: json.author }, message)
          if (json.author.username) Db.queueUser(json)

          const streamEvent = new StreamEvent()
          streamEvent.userid = `${platformName.charAt(0)}-${json.channel.userId}`
          streamEvent.event_name = json.event.type
          streamEvent.event_value = json.importantValue
          await streamEvent.save()
        } catch (err) {
          Logger.error('[RawStreamEventController]  Error')
          console.error(err)
        }
      }
    }
  }

  onClose (close) {
    Logger.debug('[RawStreamEventController] "close":\n%j', close)
    // same as: socket.on('close')
  }

  onError (error) {
    Logger.error('[RawStreamEventController] "error":\n%j', error)
    // same as: socket.on('error')
  }
}

module.exports = RawStreamEventController
