'use strict'

const moment = require('moment')
const fetch = require('node-fetch')

const blacklist = require('../Utilities/blacklist')
const ParsedMessage = require('../Utilities/parsedMessage')

const Logger = use('Logger')

const Helpers = use('Service/Helpers')

const StreamEvent = use('App/Models/StreamEvent')
const User = use('App/Models/User')

const Env = use('Env')

class Twitch {
  constructor (Config) {
    this.Config = Config || {}
    this.updateTimer = Number(this.Config.get('twitch.updateTimer'))
    this.streams = []

    this.defaultHeaders = new fetch.Headers({
      'Client-ID': Env.get('TWITCH_CLIENT_ID')
    })

    this.timer = () => setTimeout(async () => {
      const length = await this.updateStreams()

      Logger.info(`[Twitch] Updated ${length} streams.`)

      this.timer()
    }, typeof this.updateTimer === 'number' ? this.updateTimer : (1000 * 60) * 5)

    this.timer()
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
        else Logger.warning(`[Twitch] Unknown badge found, ${JSON.stringify(badge, null, 2)}`)
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
        Logger.warning('[Twitch] Unhandled messageType! %j', json)
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

  async updateStreams () {
    const userQuery = await User.query().where('platform', 'TWITCH').where('track', true).fetch()
    const streamNames = userQuery.toJSON().map(user => user.name)

    const batches = Helpers.chunks(streamNames, 100)
    const resData = []
    for (let index = 0; index < batches.length; index++) {
      const batch = batches[index]
      const request = await fetch(`https://api.twitch.tv/helix/streams?${batch.map((i, ind) => ind > 0 ? '&user_login=' + i : 'user_login=' + i).join('')}`, { headers: this.defaultHeaders })
      const response = await request.json()

      if (!response.error) resData.push(...response.data)
    }

    this.streams = this.streams.filter(i => resData.map(i => i.user_name).includes(i.name))

    for (let index = 0; index < resData.length; index++) {
      const stream = resData[index]

      const streamParsed = {
        id: stream.user_id,
        name: stream.user_name.replace(/ /g, '').toLowerCase(),
        gameID: stream.game_id,
        thumbnail: stream.thumbnail_url.replace('{width}x{height}', '1920x1080'),
        type: stream.type,
        title: stream.title,
        viewers: stream.viewer_count,
        started: stream.started_at
      }

      const streamInArr = this.streams.findIndex(i => i.name === streamParsed.name)
      if (streamInArr >= 0) this.streams[streamInArr] = streamParsed
      else this.streams.push(streamParsed)

      const streamEvent = new StreamEvent()
      streamEvent.userid = `t-${streamParsed.id}`
      streamEvent.event_name = 'viewers'
      streamEvent.event_value = String(streamParsed.viewers)
      await streamEvent.save()
    }

    return Promise.resolve(this.streams.length)
  }
}

module.exports = Twitch
