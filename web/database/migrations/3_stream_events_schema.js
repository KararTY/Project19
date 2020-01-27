'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StreamEventSchema extends Schema {
  async up () {
    this.alter('stream_events', table => {
      table.jsonb('event_extra').comment('Extra values for special events.')
    })
  }

  async down () {
    this.alter('stream_events', table => {
      table.dropColumn('event_extra')
    })
  }
}

module.exports = StreamEventSchema
