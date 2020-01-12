'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class MixerProvider extends ServiceProvider {
  register () {
    this.app.singleton('Service/Mixer', () => {
      const Config = this.app.use('Adonis/Src/Config')
      return new (require('../src/Mixer'))(Config)
    })
  }
}

module.exports = MixerProvider
