'use strict'

const blacklist = require('../Utilities/blacklist')
const ParsedMessage = require('../Utilities/parsedMessage')

class Mixer {
  constructor (Config) {
    this.Config = Config || {}
  }

  /**
   * Mixer message.
   * @param {Object} json [Documentation](https://dev.mixer.com/reference/chat/events/chatmessage)
   * @param {Number} json.channel
   * @param {String} json.user_name
   * @param {Number} json.user_id
   * @param {Array<String>} json.user_roles
   * @param {String} json.user_avatar
   * @param {Number} json.user_level
   * @param {Number} json.user_ascension_level
   * @param {Object} json.message
   * @param {Array<{ type: String,: String, text: String, source?: String, pack?: String, coords?: { x: Number, y: Number, width: Number, height: Number }, url?: String,  }>} json.message.message
   * @param {Object} json.message.meta
   * @param {Boolean?} json.message.meta.whisper
   * @param {Boolean?} json.message.meta.me
   */
  async parseMessage (json) {
    const plainText = json.message.message.map(message => message.text || '').join('')

    const parsedMessage = new ParsedMessage('mixer')

    parsedMessage.blacklisted = await blacklist(plainText)

    parsedMessage.channel = {
      name: json.token,
      id: json.channel
    }

    parsedMessage.author = {
      name: json.user_name,
      id: json.user_id,
      level: json.user_level,
      ascensionLevel: json.user_ascension_level
    }

    parsedMessage.message = plainText

    parsedMessage.badges = json.user_roles

    if (json.message.meta.me) parsedMessage.action = true

    return parsedMessage
  }

  displayMessage (parsedMessage) {
    const levels = typeof parsedMessage.author.level === 'number' && typeof parsedMessage.author.ascensionLevel === 'number'
    return `[${parsedMessage.timestamp.format('hh:mm')}] ${levels ? `[LVL ${parsedMessage.author.level}] ` : ''}${parsedMessage.author.name}${levels ? ` [${parsedMessage.author.ascensionLevel}]` : ''}: ${parsedMessage.message}`
  }

  async parseEvent (json) {

  }

  displayEvent (parsedEvent) {

  }
}
module.exports = Mixer
