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
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

/**
 * /
 */
Route.get('/', 'IndexController.index').as('index')

/**
 * /live
 */
Route.get('/live/:platform?/:channel?', 'LiveController.index')
  .middleware(['Platform', 'Channel']).as('live')

/**
 * /logs
 */
Route.route('/logs/:platform?/:timestamp?/:channel?/:username?', 'LogController.index', ['GET', 'POST'])
  .middleware(['Platform', 'Timestamp', 'Channel', 'UserByName']).as('logs')

/**
 * /stats
 */
Route.route('/stats/:platform?/:channel?', 'StatController.index', ['GET', 'POST'])
  .middleware(['Platform', 'Channel']).as('stats')

/**
 * /dashboard
 */
Route.group(() => {
  Route.get('/dashboard', 'DashboardController.index')

  // Bot commands
  Route.get('/dashboard/updatebots', 'DashboardController.updateBots')

  // User stuff
  Route.post('/dashboard', 'DashboardController.create').middleware(['Platform'])
  Route.route('/dashboard/query', 'DashboardController.query', ['GET', 'POST']).middleware(['Platform'])
  Route.get('/dashboard/:userid', 'DashboardController.read').middleware(['UserById'])
  Route.post('/dashboard/:userid', 'DashboardController.update').middleware(['UserById'])
  Route.post('/dashboard/:userid/delete', 'DashboardController.delete').middleware(['UserById'])
}).middleware(['TrustedSource']).as('dashboard')
