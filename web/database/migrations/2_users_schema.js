'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  async up () {
    this.alter('users', table => {
      table.string('name', 25).comment('User name.')
    })
  }

  async down () {
    this.alter('users', table => {
      table.dropColumn('users')
    })
  }
}

module.exports = UserSchema
