'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Env = use('Env')

class ChatLogsSchema extends Schema {
  async up () {
    if (Env.get('DB_CONNECTION') === 'pg') await this.db.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";') // For PostgreSQL only.

    this.create('chat_logs', async table => {
      table.increments()
      table.string('userid', 64).notNullable().comment('User id from platform. Starts with "t-", or "m-" for respective platform(s).')
      table.string('channeluserid', 64).notNullable().comment('User id from platform for channel. Starts with "t-", or "m-" for respective platform(s).')
      table.string('message', 1024).notNullable().comment('Chat message.')
      table.timestamps()
    })
  }

  down () {
    this.drop('chat_logs')
  }
}

module.exports = ChatLogsSchema
