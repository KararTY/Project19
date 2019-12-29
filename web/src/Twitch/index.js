'use strict'

const blacklist = require('../Utilities/blacklist')
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
   * @param {Object} json.badges
   * @param {Boolean} json.badges.hasAdmin
   * @param {Boolean} json.badges.hasBits
   * @param {Boolean} json.badges.hasBroadcaster
   * @param {Boolean} json.badges.hasGlobalMod
   * @param {Boolean} json.badges.hasModerator
   * @param {Boolean} json.badges.hasSubscriber
   * @param {Boolean} json.badges.hasStaff
   * @param {Boolean} json.badges.hasTurbo
   * @param {Boolean} json.badges.hasVIP
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

  async parse (json) {
    const blacklisted = await blacklist(json.messageText)
    if (blacklisted) return false

    const parsedMessage = {
      channel: {
        name: json.channelName,
        id: json.channelID
      },
      author: {
        name: json.displayName,
        id: json.senderUserID
      },
      message: json.messageText,
      badges: [],
      emotes: [],
      timestamp: json.serverTimestamp
      // subscribedFor: number
    }

    const badges = Object.entries(json.badges)
    for (let index = 0; index < badges.length; index++) {
      if (badges[index][1] && badges[index][0] === 'hasSubscriber') {
        parsedMessage.badges.push(badges[index][0])
        parsedMessage.subscribedFor = json.badgeInfo.hasSubscriber
      } else if (badges[index][1]) parsedMessage.badges.push(badges[index][0])
    }

    parsedMessage.emotes = json.emotes

    return this.display(parsedMessage)
  }

  display (parsedMessage) {
    return `[${moment(parsedMessage.timestamp).format('hh:mm')}] ${parsedMessage.author.name}: ${parsedMessage.message}`
  }
}

module.exports = Twitch
