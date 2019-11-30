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

Route.get('/', () => {
  return `
  <html>
    <head>
      <link rel="stylesheet" href="/style.css" />
    </head>
    <body>
      <section>
        <div class="logo"></div>
        <div class="title"></div>
        <div class="subtitle">
          <p>AdonisJs simplicity will make you feel confident about your code</p>
          <p>
            Don't know where to start? Read the <a href="https://adonisjs.com/docs">documentation</a>.
          </p>
        </div>
        <p id="connection">Offline</p>
        <div id="chat"></div>
      </section>
    </body>
    <script src="/babel-polyfill.min@6.26.0.js"></script>
    <script src="/Ws.browser.min@1.0.9.js"></script>
    <script src="/socket.js"></script>
  </html>
  `
})
