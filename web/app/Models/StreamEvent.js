'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class StreamEvent extends Model {
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

  getEventExtra (event) {
    if (typeof event === 'string') return JSON.parse(event)
    else return event
  }

  static get incrementing () {
    return false
  }
}

module.exports = StreamEvent
