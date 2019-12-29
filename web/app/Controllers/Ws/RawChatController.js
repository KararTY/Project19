'use strict'

const Ws = use('Ws')
const Logger = use('Logger')

const Twitch = use('Service/Twitch')

class RawChatController {
  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request

    // Logger.debug('%j', { socket, request })
  }

  async onMessage ({ twitch, twitchOfflineBatch, mixer, mixerOfflineBatch }) {
    const platform = twitch ? 'twitch' : mixer ? 'mixer' : false
    if (platform) {
      let topicString = 'chat:'
      let message

      if (twitch) {
        topicString += `${platform}.${twitch.channelName}`
        message = await Twitch.parse(twitch)
      } else if (mixer) {
        topicString += `${platform}.${mixer.token}`
        message = `#${mixer.token} ${mixer.user_name}: ${mixer.message.message.map(message => message.text).join('')}`
      }

      Logger.debug(`[RawChatController] <${platform.toUpperCase()}> message received: ${message}`)
      const channel = Ws.getChannel('chat:*').topic(topicString)
      if (channel) channel.broadcast('message', message)
    } else if (twitchOfflineBatch) Logger.debug(`Twitch messages batch received: ${twitchOfflineBatch.length}`)
    // message.twitchOfflineBatch.map(message => message.messageText).join('| ')

    else if (mixerOfflineBatch) Logger.debug(`Mixer messages batch received: ${mixerOfflineBatch.length}`)
    // message.mixerOfflineBatch.map(mixer => mixer.message.message.map(message => message.text).join('')).join('| ')

    // same as: socket.on('message')
  }

  onClose (close) {
    Logger.debug('[RawChatController] "close":\n%j', close)
    // same as: socket.on('close')
  }

  onError (error) {
    Logger.error('[RawChatController] "error":\n%j', error)
    // same as: socket.on('error')
  }
}

module.exports = RawChatController
