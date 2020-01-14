'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class LogsProvider extends ServiceProvider {
  register () {
    this.app.singleton('Service/Logs', () => {
      const Config = this.app.use('Adonis/Src/Config')
      return new (require('../src/Logs'))(Config)
    })
  }
}

module.exports = LogsProvider
