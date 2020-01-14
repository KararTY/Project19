'use strict'

const moment = require('moment')

class ParsedMessage {
  constructor (platform) {
    this.platform = platform || ''

    this.channel = {
      name: '',
      id: ''
    }

    this.author = {
      name: '',
      id: ''
    }

    this.message = ''

    /**
     * Can contain "admin", "bits", "broadcaster", "global_mod", "moderator", "subscriber", "staff", "turbo", "user".
     */
    this.badges = []

    this.emotes = []

    this.timestamp = moment().utc()

    this.color = {
      r: '',
      g: '',
      b: ''
    }

    this.action = false

    // this.subscribedFor = ''

    if (platform === 'mixer') {
      this.author.level = ''
      this.author.ascensionLevel = ''
    }

    this.blacklisted = false
  }
}

module.exports = ParsedMessage
