'use strict'

const { hooks } = require('@adonisjs/ignitor')

hooks.after.providersBooted(async () => {
  const View = use('View')
  const feather = require('feather-icons')
  const moment = require('moment')

  const Config = use('Adonis/Src/Config')

  View.global('feather', feather)

  View.global('moment', moment)

  View.global('icon', (iconName, size = { width: 16, height: 16 }) => {
    return feather.icons[iconName].toSvg(size)
  })

  const jokes = Config.get('jokes.randomSubtitle')
  View.global('randomSubtitle', () => {
    return jokes[Math.floor(Math.random() * jokes.length)]
  })

  View.global('isActive', (variable, compareTo) => {
    if (variable === compareTo) return 'is-active'
    else return ''
  })
})
