'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ChatLogsSchema extends Schema {
  async up () {
    console.log('[1_chat_logs_schema.js] UP')

    this.create('chat_logs', async table => {
      table.increments()
      table.string('userid', 64).notNullable().comment('User id from platform. Starts with "t-", or "m-" for respective platform(s).')
      table.string('channeluserid', 64).notNullable().comment('User id from platform for channel. Starts with "t-", or "m-" for respective platform(s).')
      table.string('message', 1024).notNullable().comment('Chat message.')
      table.timestamps()
    })
  }

  down () {
    console.log('[1_chat_logs_schema.js] DOWN')

    this.drop('chat_logs')
  }
}

module.exports = ChatLogsSchema
