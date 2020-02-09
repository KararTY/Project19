'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  async up () {
    console.log('[3_users_schema.js] UP')

    this.alter('users', table => {
      table.boolean('track').defaultTo(false).comment('Track user.')
    })
  }

  async down () {
    console.log('[3_users_schema.js] DOWN')

    this.alter('users', table => {
      table.dropColumn('track')
    })
  }
}

module.exports = UserSchema
