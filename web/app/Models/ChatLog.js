'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class ChatLog extends Model {
  static get createdAtColumn () {
    return null
  }
}

module.exports = ChatLog
