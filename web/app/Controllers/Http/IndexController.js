'use strict'

class IndexController {
  async index ({ view }) {
    return view.render('core.template', {
      web: {
        template: 'index',
        chart: 'top'
      }
    })
  }
}

module.exports = IndexController
