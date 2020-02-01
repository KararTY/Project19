'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', 'IndexController.index').as('index')

Route.get('/live/:platform?/:channel?', 'LiveController.index').as('live')

Route.route('/logs/:platform?/:timestamp?/:channelname?/:username?', 'LogController.index', ['GET', 'POST']).as('logs')

Route.route('/stats/:platform?/:channelname?', 'StatController.index', ['GET', 'POST']).as('stats')
