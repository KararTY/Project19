'use strict'

const moment = require('moment')

class Helpers {
  // https://stackoverflow.com/a/55435856
  chunks (arr, n) {
    function * ch (arr, n) {
      for (let i = 0; i < arr.length; i += n) {
        yield (arr.slice(i, i + n))
      }
    }

    return [...ch(arr, n)]
  }

  ParsedMessage (platform) {
    const obj = {
      platform: platform || '',
      channel: {
        name: '',
        id: ''
      },
      author: {
        name: '',
        id: ''
      },
      message: '',
      /**
       * Can contain "admin", "bits", "broadcaster", "global_mod", "moderator", "subscriber", "staff", "turbo", "user".
       */
      badges: [],
      emotes: [],
      timestamp: moment().utc(),
      setTimestamp: (timestamp) => moment(timestamp).utc(),
      color: {
        r: '',
        g: '',
        b: ''
      },
      // this.subscribedFor = '',
      blacklisted: false,
      action: false
    }

    if (platform === 'mixer') {
      obj.author.level = ''
      obj.author.ascensionLevel = ''
    }

    return obj
  }

  timeout (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

module.exports = Helpers
