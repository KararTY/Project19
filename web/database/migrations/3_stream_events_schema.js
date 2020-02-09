'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StreamEventSchema extends Schema {
  async up () {
    console.log('[3_stream_events_schema.js] UP')

    this.alter('stream_events', table => {
      table.jsonb('event_extra').comment('Extra values for special events.')
    })
  }

  async down () {
    console.log('[3_stream_events_schema.js] DOWN')

    this.alter('stream_events', table => {
      table.dropColumn('event_extra')
    })
  }
}

module.exports = StreamEventSchema
