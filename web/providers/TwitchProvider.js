'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class TwitchProvider extends ServiceProvider {
  register () {
    this.app.singleton('Service/Twitch', () => {
      const Config = this.app.use('Adonis/Src/Config')
      return new (require('../src/Twitch'))(Config)
    })
  }
}

module.exports = TwitchProvider
