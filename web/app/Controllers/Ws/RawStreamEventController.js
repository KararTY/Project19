'use strict'

const Ws = use('Ws')
const Logger = use('Logger')

const Twitch = use('Service/Twitch')
const Mixer = use('Service/Mixer')

class RawStreamEventController {
  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request

    // Logger.debug('%j', { socket, request })
  }

  async onMessage ({ twitch, twitchOfflineBatch, mixer, mixerOfflineBatch }) {
    const platformName = twitch ? 'twitch' : mixer ? 'mixer' : false

    // if (twitch || mixer) {
    //  const topicString = `streamevent:${platformName}.${twitch ? twitch.channelName : mixer.token}`
    //  const PlatformEvent = twitch ? Twitch : mixer ? Mixer : false
    //  const eventObject = twitch || mixer
    //
    //  /**
    //   * Event {
    //   *  name: string, len 32
    //   *  value: string, len 64
    //   * }
    //   */
    //  try {
    //    Logger.debug(`[RawStreamEventController] event received: ${message}`)
    //  } catch (err) {
    //    console.error(err)
    //    Logger.debug('Error', err)
    //  }
    // } else if (twitchOfflineBatch || mixerOfflineBatch) {
    //  const PlatformEvent = twitchOfflineBatch ? Twitch : mixerOfflineBatch ? Mixer : false
    //  const array = twitchOfflineBatch || mixerOfflineBatch
    //
    //  Logger.debug(`[RawStreamEventController] ${platformName.toUpperCase()} events batch received: ${array.length}`)
    //
    //  try {
    //
    //  } catch (err) {
    //    console.error(err)
    //    Logger.debug('Error', err)
    //  }
    // }
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
