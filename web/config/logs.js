'use strict'

const path = require('path')

module.exports = {
  enabled: true,

  /**
   * 0 - Save as text files.
   * 1 - Save to DB.
   */
  method: 1,

  pathToFile: path.join(__dirname, '..', '..', 'logs'),

  writeTimer: (1000 * 60) * 0.1
}
