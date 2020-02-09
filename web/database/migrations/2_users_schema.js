'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  async up () {
    console.log('[2_users_schema.js] UP')

    this.alter('users', table => {
      table.string('name', 25).comment('User name.')
    })
  }

  async down () {
    console.log('[2_users_schema.js] DOWN')

    this.alter('users', table => {
      table.dropColumn('users')
    })
  }
}

module.exports = UserSchema
