'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class SocketProvider extends ServiceProvider {
  register () {
    this.app.singleton('Service/Socket', () => {
      const Config = this.app.use('Adonis/Src/Config')
      return new (require('../src/Socket'))(Config)
    })
  }
}

module.exports = SocketProvider
