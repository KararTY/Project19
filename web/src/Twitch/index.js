'use strict'

const blacklist = require('../Utilities/blacklist')
const ParsedMessage = require('../Utilities/parsedMessage')
const moment = require('moment')

class Twitch {
  constructor (Config) {
    this.Config = Config || {}
  }

  /**
   * Twitch message.
   * @param {Object} json [Documentation](https://robotty.github.io/dank-twitch-irc/classes/privmsgmessage.html)
   * @param {String} json.messageText Message.
   * @param {Boolean} json.isAction /me usage.
   * @param {Object} json.badgeInfo
   * @param {Array<{ name: String, version: String }>} json.badges
   * @param {Number?} json.bits
   * @param {{ r: String, g: String, b: String }?} json.color
   * @param {String} json.displayName
   * @param {Array<{ id: String, startIndex: Number, endIndex: Number, code: String }>?} json.emotes
   * @param {string} json.messageID
   * @param {string} json.channelID
   * @param {string} json.channelName
   * @param {Date} json.serverTimestamp
   * @param {Number} json.senderUserID
   */
  async parseMessage (json) {
    const parsedMessage = new ParsedMessage('twitch')

    parsedMessage.blacklisted = await blacklist(json.messageText)

    parsedMessage.channel = {
      name: json.channelName,
      id: json.channelID
    }

    parsedMessage.author = {
      name: json.displayName,
      id: json.senderUserID
    }

    parsedMessage.message = json.messageText

    for (let index = 0; index < json.badges.length; index++) {
      const badge = json.badges[index]
      if (badge.name === 'subscriber') {
        const subBadge = json.badgeInfo.find(b => b.name === 'subscriber')
        if (subBadge) parsedMessage.subscribedFor = subBadge.version
        else console.log(badge)
      }
      parsedMessage.badges.push(badge.name)
    }

    parsedMessage.emotes = json.emotes

    parsedMessage.timestamp = moment(json.serverTimestamp).utc()

    if (json.color) parsedMessage.color = json.color

    if (json.isAction) parsedMessage.action = true

    return parsedMessage
  }

  displayMessage (parsedMessage) {
    return `[${parsedMessage.timestamp.format('hh:mm')}] ${parsedMessage.author.name}: ${parsedMessage.message}`
  }

  async parseEvent (json) {

  }

  displayEvent (parsedEvent) {

  }
}

module.exports = Twitch
