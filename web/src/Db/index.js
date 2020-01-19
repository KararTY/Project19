'use strict'

const User = use('App/Models/User')
const Logger = use('Logger')

class Database {
  constructor (Config) {
    this.Config = Config || {}
    this.enabled = this.Config.get('db.enabled')
    this.writeTimer = Number(this.Config.get('db.writeTimer'))

    this.queue = []

    this.timer = () => setTimeout(async () => {
      const tempQueue = [...this.queue]
      this.queue = []

      if (tempQueue.length) {
        const arr = []
        let counter = 0

        while (tempQueue.length) {
          const queueItem = tempQueue.shift()

          let cont = false

          const platformUserAndChannel = `${queueItem.platform.charAt(0)}-${queueItem.author.id}-${queueItem.channel.id}`
          if (!arr.includes(platformUserAndChannel)) {
            arr.push(platformUserAndChannel)
            cont = true
          }

          if (cont) {
            counter++
            await this.handleUser(queueItem)
          }
        }

        Logger.info(`[Db] Checked ${counter} users...`)
      }

      this.timer()
    }, typeof this.writeTimer === 'number' ? this.writeTimer : (1000 * 60) * 5)

    if (this.enabled) this.timer()
  }

  queueUser (json) {
    if (this.enabled) {
      if (!json) throw new Error('No json.')

      this.queue.push(json)

      return this.queue.length
    }
  }

  async handleUser (json) {
    // Order is important.
    const requests = await Promise.all([
      User.findBy('userid', `${json.platform.charAt(0)}-${json.author.id}`),
      User.findBy('userid', `${json.platform.charAt(0)}-${json.channel.id}`)
    ])

    for (let index = 0; index < requests.length; index++) {
      let request = requests[index]

      try {
        if (request === null) {
          request = new User()
          request.userid = `${json.platform.charAt(0)}-${index === 0 ? json.author.id : json.channel.id}`
          request.name = index === 0 ? json.author.username : json.channel.name
          Logger.debug('[Db] New user.')
          request.platform = json.platform.toUpperCase()
          if (index === 0) request.channels = [json.channel.id]
          await request.save()
        } else if (index === 0) {
          let changes = false

          if (!request.channels.includes(json.channel.id)) {
            request.channels = request.channels.concat(json.channel.id)
            changes = true
          }

          if (request.name !== json.author.username.toLowerCase()) {
            request.name = json.author.username
            changes = true
          }

          if (changes) {
            Logger.debug(`[Db] User ${request.id} changes.`)
            await request.save()
          }
        } else if (index === 1) {
          let changes = false

          if (request.name !== json.channel.name.toLowerCase()) {
            request.name = json.channel.name
            changes = true
          }

          if (changes) {
            Logger.debug(`[Db] User (Channel) ${request.id} changes.`)
            await request.save()
          }
        }
      } catch (err) {
        Logger.warn('[Db] Error %j %j', err, request)
      }
    }

    return Promise.resolve()
  }
}

module.exports = Database
