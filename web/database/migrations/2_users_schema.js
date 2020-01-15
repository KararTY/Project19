'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  async up () {
    this.alter('users', table => {
      table.string('name', 25).unique().comment('User name.')
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
