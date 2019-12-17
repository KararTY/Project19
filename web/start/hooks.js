const { hooks } = require('@adonisjs/ignitor')

hooks.after.providersBooted(async () => {
  const View = use('View')
  const feather = require('feather-icons')
  const moment = require('moment')

  View.global('feather', feather)

  View.global('moment', moment)

  View.global('icon', (iconName, size = { width: 16, height: 16 }) => {
    return feather.icons[iconName].toSvg(size)
  })
})
