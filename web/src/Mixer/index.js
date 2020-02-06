'use strict'

const fetch = require('node-fetch')

const blacklist = require('../Utilities/blacklist')

const Logger = use('Logger')

const { chunks, ParsedMessage, timeout } = use('Service/Helpers')

const StreamEvent = use('App/Models/StreamEvent')
const User = use('App/Models/User')

class Mixer {
  constructor (Config) {
    this.Config = Config || {}
    this.updateTimer = Number(this.Config.get('mixer.updateTimer'))
    this.enabled = this.Config.get('mixer.enabled')
    this.streams = []

    this.defaultHeaders = new fetch.Headers({
      'User-Agent': 'Project-19/Nodejs github.com/kararty/project19'
    })

    this.timer = () => setTimeout(async () => {
      const length = await this.updateStreams()

      Logger.info(`[Mixer] Updated ${length} streams.`)

      this.timer()
    }, typeof this.updateTimer === 'number' ? this.updateTimer : (1000 * 60) * 5)

    if (this.enabled) this.timer()
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
    if (!this.enabled) return

    const parsedMessage = ParsedMessage('mixer')

    let plainText
    if (json.message) {
      plainText = json.message.message.map(message => message.text || '').join('')
      if (json.message.meta && json.message.meta.me) parsedMessage.action = true
    }

    parsedMessage.blacklisted = await blacklist(plainText)

    parsedMessage.channel = {
      name: json.token,
      channelId: json.channel,
      userId: json.channelUserId
    }

    parsedMessage.author = {
      name: json.user_name,
      username: json.user_name,
      userId: json.user_id,
      level: json.user_level,
      ascensionLevel: json.user_ascension_level
    }

    parsedMessage.message = plainText

    parsedMessage.badges = json.user_roles

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
    if (!this.enabled) return

    const parsedMessage = await this.parseMessage(json)

    parsedMessage.event = {
      name: json.skill.skill_name,
      icon: json.skill.icon_url,
      cost: json.skill.cost,
      currency: json.skill.currency
    }

    parsedMessage.importantValue = parsedMessage.event.cost

    return parsedMessage
  }

  displayEvent (parsedEvent) {
    return `[${parsedEvent.timestamp.format('HH:mm')}] ${parsedEvent.author.name} executed ${parsedEvent.event.name} for ${parsedEvent.event.cost} ${parsedEvent.event.currency}.`
  }

  async updateStreams () {
    const userQuery = await User.query().where('platform', 'MIXER').where('track', true).fetch()
    const streamNames = userQuery.toJSON().map(user => user.name)

    const batches = chunks(streamNames, 1000)
    const resData = []
    for (let index = 0; index < batches.length; index++) {
      const batch = batches[index]

      for (let index = 0; index < batch.length; index++) {
        const streamer = batch[index]
        try {
          const request = await fetch(`https://mixer.com/api/v1/channels/${streamer}`, { headers: this.defaultHeaders })
          const response = await request.json()
          if (!response.error && response.online) resData.push(response)
        } catch (err) {
          Logger.error('[Mixer] Error!')
          console.error(err)
        }
      }

      if (batches.length > 1) await timeout(1000 * 300)
    }

    resData.sort((a, b) => {
      return b.viewersCurrent - a.viewersCurrent
    })

    this.streams = this.streams.filter(i => resData.map(i => i.user_name).includes(i.name))

    const streams = []
    for (let index = 0; index < resData.length; index++) {
      const stream = resData[index]

      const streamParsed = {
        id: stream.userId,
        name: stream.token.replace(/ /g, '').toLowerCase(),
        gameID: stream.type.id,
        gameName: stream.type.name,
        thumbnail: `https://thumbs.mixer.com/channel/${stream.id}.big.jpg`,
        title: stream.name,
        viewers: stream.viewersCurrent,
        started: stream.updatedAt
      }

      streams.push(streamParsed)

      const streamInArr = this.streams.findIndex(i => i.name === streamParsed.name)
      if (streamInArr >= 0) this.streams[streamInArr] = streamParsed
      else this.streams.push(streamParsed)

      const streamEvent = new StreamEvent()
      streamEvent.userid = `m-${streamParsed.id}`
      streamEvent.event_name = 'viewers'
      streamEvent.event_value = String(streamParsed.viewers)
      await streamEvent.save()

      if (index < 3) {
        const streamQuery = await StreamEvent.findBy('event_name', `mixer-top-${index}`)
        const streamEvent = streamQuery || new StreamEvent()
        streamEvent.userid = `m-${streamParsed.id}`
        streamEvent.event_name = `mixer-top-${index}`
        streamEvent.event_value = JSON.stringify(streamParsed.viewers)
        streamEvent.event_extra = JSON.stringify({
          thumbnail: streamParsed.thumbnail,
          name: streamParsed.name
        })
        await streamEvent.save()
      }
    }

    return Promise.resolve(this.streams.length)
  }

  async getUser (name) {
    try {
      const request = await fetch(`https://mixer.com/api/v1/users/search?query=${name}&limit=1`, { headers: this.defaultHeaders })
      const response = await request.json()

      const firstRes = response[0]

      if (firstRes) {
        return {
          id: firstRes.id,
          name: firstRes.username,
          description: firstRes.bio,
          avatar: firstRes.avatarUrl
        }
      } else {
        return Promise.reject(new Error('Not found.'))
      }
    } catch (err) {
      Logger.error('[Mixer] Error!')
      console.error(err)
      return Promise.reject(err)
    }
  }
}

module.exports = Mixer
