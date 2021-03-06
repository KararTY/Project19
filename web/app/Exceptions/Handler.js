'use strict'

const BaseExceptionHandler = use('BaseExceptionHandler')
const Logger = use('Logger')

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Object} error
   * @param  {Object} options.request
   * @param  {Object} options.response
   *
   * @return {void}
   */
  async handle (error, { response, request }) {
    const method = request.method()

    let message
    if (error.code === 'E_ROUTE_NOT_FOUND') {
      message = 'Not found.'
    } else if (['E_EMPTY_QUERY_RESULT', 'E_UNAUTHORIZED_CONNECTION', 'E_PLATFORM_NOT_FOUND', 'E_USER_NOT_FOUND', 'E_CHANNEL_NOT_FOUND', 'E_TIMESTAMP_INVALID', 'E_LOGS_NOT_FOUND'].includes(error.code)) message = error.message

    if (!message) return super.handle(...arguments)
    else if (method === 'GET') {
      return response.status(error.status).send(`
        <html>
          <head>
            <link rel="stylesheet" text="text/css" href="/css/stylesheet.css" />
          </head>
          <body>
            <section class="section">
              <div class="container content">
                <h1>Error ${error.status}</h1>
                <h3>Error ${message}</h3>
              </div>
            </section>
          </body>
        </html>
      `.replace(/\s\s/g, ''))
    } else {
      return response.status(error.status).json({
        code: error.code,
        status: error.status,
        message: error.message
      })
    }
  }

  /**
   * Report exception for logging or debugging.
   *
   * @method report
   *
   * @param  {Object} error
   * @param  {Object} options.request
   *
   * @return {void}
   */
  async report (error, { request }) {
    Logger.debug('Error:\n%s\nFrom:%j', error, request)
  }
}

module.exports = ExceptionHandler
