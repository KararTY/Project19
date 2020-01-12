'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StreamEventSchema extends Schema {
  async up () {
    await this.db.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";') // For PostgreSQL only.

    this.create('streamevents', table => {
      table.uuid('id').unique().primary().defaultTo(this.db.raw('uuid_generate_v4()')).comment('Primary key, uuid.')
      table.string('userid', 64).unique().notNullable().comment('User id from platform. Starts with "t-", or "m-" for respective platform(s).')
      table.string('event_name', 32).notNullable().comment('Event name.')
      table.string('event_value', 64).notNullable().defaultTo('0').comment('Event value.')
      table.timestamps()
    })
  }

  down () {
    this.drop('streamevents')
  }
}

module.exports = StreamEventSchema
