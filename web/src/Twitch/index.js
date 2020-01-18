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
   * @param {String} json.senderUsername
   * @param {Array<{ id: String, startIndex: Number, endIndex: Number, code: String }>?} json.emotes
   * @param {String} json.messageID
   * @param {String} json.channelID
   * @param {String} json.channelName
   * @param {Date} json.serverTimestamp
   * @param {Number} json.senderUserID
   */
  async parseMessage (json) {
    const parsedMessage = new ParsedMessage('twitch')

    // TODO: TWITCH USERNAME CHECK?
    if (json.messageText) parsedMessage.blacklisted = await blacklist(json.messageText)
    else parsedMessage.blacklisted = false

    parsedMessage.channel = {
      name: json.channelName,
      id: json.channelID
    }

    parsedMessage.author = {
      name: json.displayName,
      username: json.senderUsername,
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
    return `[${parsedMessage.timestamp.format('HH:mm')}] ${parsedMessage.author.name}: ${parsedMessage.message}`
  }

  /**
   * Twitch USERNOTICE message.
   * @param {Object} json [Documentation](https://robotty.github.io/dank-twitch-irc/classes/usernoticemessage.html)
   * @param {Object} json.eventParams
   * @param {Boolean?} json.eventParams.shouldShareStreak FOR SHARESSTREAKSUB / HIDDENSTREAKSUB
   * @param {Number?} json.eventParams.streakMonths FOR SHARESSTREAKSUB / HIDDENSTREAKSUB
   * @param {String?} json.eventParams.displayName FOR RAID
   * @param {Number?} json.eventParams.viewerCount FOR RAID
   * @param {Number?} json.eventParams.cumulativeMonths FOR SUB
   * @param {Number?} json.eventParams.months FOR SUBGIFT
   * @param {String?} json.eventParams.recipientDisplayName FOR SUBGIFT / ANONSUBGIFT
   * @param {String?} json.eventParams.recipientUsername FOR SUBGIFT / ANONSUBGIFT
   * @param {Number?} json.eventParams.recipientID FOR SUBGIFT / ANONSUBGIFT
   * @param {String?} json.eventParams.subPlan FOR SUB / SUBGIFT / ANONSUBGIFT
   * @param {String?} json.eventParams.subPlanName FOR SUB / SUBGIFT / ANONSUBGIFT
   * @param {String?} json.eventParams.promoGiftTotal FOR GIFTPAIDUPGRADE / ANONGIFTPAIDUPGRADE
   * @param {String?} json.eventParams.promoName FOR GIFTPAIDUPGRADE / ANONGIFTPAIDUPGRADE
   * @param {String?} json.eventParams.senderLogin FOR GIFTPAIDUPGRADE
   * @param {String?} json.eventParams.ritualName FOR RITUAL
   * @param {Number?} json.eventParams.threshold FOR BITSBADGETIER
   * @param {String} json.messageTypeID IMPORTANT FOR FIGURING OUT WHICH eventParams FIELDS TO USE.
   * @param {String} json.systemMessage
   */
  async parseEvent (json) {
    const parsedMessage = await this.parseMessage(json)

    switch (json.messageTypeID) {
      case 'sub':
      case 'resub':
        parsedMessage.event = {
          type: json.messageTypeID,
          subPlan: json.eventParams.subPlan,
          subPlanName: json.eventParams.subPlanName,
          months: json.eventParams.cumulativeMonths,
          streakMonths: json.eventParams.streakMonths,
          shouldShareStreak: json.eventParams.shouldShareStreak
        }
        parsedMessage.importantValue = parsedMessage.event.subPlan
        break
      case 'subgift':
      case 'anonsubgift':
        parsedMessage.event = {
          type: json.messageTypeID,
          subPlan: json.eventParams.subPlan,
          subPlanName: json.eventParams.subPlanName,
          months: json.eventParams.months,
          recipient: {
            id: json.eventParams.recipientID,
            name: json.eventParams.recipientDisplayName,
            username: json.eventParams.recipientUsername
          }
        }
        parsedMessage.importantValue = parsedMessage.event.subPlan
        break
      case 'giftpaidupgrade':
      case 'anongiftpaidupgrade':
        parsedMessage.event = {
          type: json.messageTypeID,
          promoGiftTotal: json.eventParams.promoGiftTotal,
          promoName: json.eventParams.promoName,
          senderLogin: json.eventParams.senderLogin
        }
        parsedMessage.importantValue = parsedMessage.event.promoGiftTotal
        break
      case 'raid':
        parsedMessage.event = {
          type: json.messageTypeID,
          viewerCount: json.eventParams.viewerCount,
          displayName: json.eventParams.displayName
        }
        parsedMessage.importantValue = parsedMessage.event.viewerCount
        break
      case 'ritual':
        // New chatter!
        parsedMessage.event = {
          type: json.messageTypeID,
          name: json.eventParams.ritualName
        }
        parsedMessage.importantValue = parsedMessage.event.name
        break
      case 'bitsbadgetier':
        parsedMessage.event = {
          type: json.messageTypeID,
          threshold: json.eventParams.threshold
        }
        parsedMessage.importantValue = parsedMessage.event.threshold
        break
      // case 'submysterygift':
      // case 'rewardgift':
      default:
        console.error('#### UNHANDLED EVENT messagetype!', json)
        parsedMessage.event = {
          type: json.messageTypeID
        }
        break
    }

    parsedMessage.systemMessage = json.systemMessage

    return parsedMessage
  }

  displayEvent (parsedEvent) {
    return `[${parsedEvent.timestamp.format('HH:mm')}] ${parsedEvent.systemMessage}`
  }
}

module.exports = Twitch
