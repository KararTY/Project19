'use strict'

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

  /**
   * Sends off stringified JSON to database.
   * @param {Array} json
   */
  setChannels (json) {
    return JSON.stringify(json)
  }

  static get incrementing () {
    return false
  }
}

module.exports = User
