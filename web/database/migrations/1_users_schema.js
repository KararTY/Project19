'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Env = use('Env')

class UserSchema extends Schema {
  async up () {
    if (Env.get('DB_CONNECTION') === 'pg') await this.db.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";') // For PostgreSQL only.

    this.create('users', table => {
      table.uuid('id').unique().primary().defaultTo(this.db.raw('uuid_generate_v4()')).comment('Primary key, uuid.')
      table.string('userid', 64).unique().notNullable().comment('User id from platform. Starts with "t-", or "m-" for respective platform(s).')
      table.enu('platform', ['TWITCH', 'MIXER']).notNullable().comment('The platform the user is in.')
      table.integer('rank').unsigned().notNullable().defaultTo(0).comment('Bot access rank. Defaults to 0.')
      table.jsonb('channels').default(JSON.stringify([])).notNullable().comment('Channels the user has typed in.')
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
