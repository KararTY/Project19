'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

module.exports = {
  websocketIPs: ['127.0.0.1', '0.0.0.0', Env.get('HOST')],
  dashboardIPs: ['127.0.0.1', '0.0.0.0', Env.get('HOST')]
}
