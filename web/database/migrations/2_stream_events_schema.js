'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StreamEventSchema extends Schema {
  async up () {
    this.alter('stream_events', table => {
      table.dropColumn('userid')
    })
    this.alter('stream_events', table => {
      table.string('userid', 64).notNullable().comment('User id from platform. Starts with "t-", or "m-" for respective platform(s).')
    })
  }

  async down () {
    this.alter('stream_events', table => {
      table.dropColumn('userid')
    })
    this.alter('stream_events', table => {
      table.string('userid', 64).unique().notNullable().comment('User id from platform. Starts with "t-", or "m-" for respective platform(s).')
    })
  }
}

module.exports = StreamEventSchema
