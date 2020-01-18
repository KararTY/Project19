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
   * @param {String} json.id
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
      username: json.user_name,
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
    return `[${parsedMessage.timestamp.format('HH:mm')}] ${levels ? `[LVL ${parsedMessage.author.level}] ` : ''}${parsedMessage.author.name}${levels ? ` [${parsedMessage.author.ascensionLevel}]` : ''}: ${parsedMessage.message}`
  }

  /**
   * Mixer SKILL ATTRIBUTION message.
   * @param {Object} json [Documentation](https://dev.mixer.com/reference/chat/events/skillattribution)
   * @param {Object} json.skill
   * @param {String} json.skill.skill_id
   * @param {String} json.skill.skill_name
   * @param {String} json.skill.execution_id
   * @param {String} json.skill.icon_url
   * @param {String} json.skill.cost
   * @param {String} json.skill.currency
   */
  async parseEvent (json) {
    const parsedMessage = await this.parseMessage(json)

    parsedMessage.event = {
      name: json.skill.skill_name,
      icon: json.skill.icon_url,
      cost: json.skill.cost,
      currency: json.skill.currency
    }

    return parsedMessage
  }

  displayEvent (parsedEvent) {
    return `[${parsedEvent.timestamp.format('HH:mm')}] ${parsedEvent.author.name} executed ${parsedEvent.event.name} for ${parsedEvent.event.cost} ${parsedEvent.event.currency}.`
  }
}
module.exports = Mixer
