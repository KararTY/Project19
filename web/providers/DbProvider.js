'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class DbProvider extends ServiceProvider {
  register () {
    this.app.singleton('Service/Db', () => {
      const Config = this.app.use('Adonis/Src/Config')
      return new (require('../src/Db'))(Config)
    })
  }
}

module.exports = DbProvider
