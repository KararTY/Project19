'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  async up () {
    this.alter('users', table => {
      table.boolean('track').defaultTo(false).comment('Track user.')
    })
  }

  async down () {
    this.alter('users', table => {
      table.dropColumn('track')
    })
  }
}

module.exports = UserSchema
