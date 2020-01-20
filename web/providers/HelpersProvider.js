'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class HelpersProvider extends ServiceProvider {
  register () {
    this.app.singleton('Service/Helpers', () => {
      return new (require('../src/Helpers'))()
    })
  }
}

module.exports = HelpersProvider
