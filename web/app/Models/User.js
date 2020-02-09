'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class User extends Model {
  static get primaryKey () {
    return 'id'
  }

  /**
   * Define "computed" fields here first.
   */
  static get computed () {
    return ['userIdNumber']
  }

  /**
   * Slices the beginning 'x-' letters from userid field.
   * @param {string} userid
   */
  getUserIdNumber ({ userid }) {
    return userid.slice(2)
  }

  getChannels (channels) {
    if (typeof channels === 'string') return JSON.parse(channels)
    else return channels
  }

  /**
   * Sends off stringified JSON to database.
   * @param {Array} json
   */
  setChannels (json) {
    return JSON.stringify(json)
  }

  setName (name) {
    return name.toLowerCase()
  }

  static get incrementing () {
    return false
  }
}

module.exports = User
