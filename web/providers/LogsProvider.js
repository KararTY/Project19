'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class LogsProvider extends ServiceProvider {
  register () {
    this.app.singleton('Service/Logs', () => {
      const Config = this.app.use('Adonis/Src/Config')
      const method = Config.get('logs.method')
      switch (method) {
        case 1:
          return new (require('../src/Logs/db'))(Config)
        default:
          return new (require('../src/Logs/file'))(Config)
      }
    })
  }
}

module.exports = LogsProvider
