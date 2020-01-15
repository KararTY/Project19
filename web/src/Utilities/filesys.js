'use strict'

const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const readFile = promisify(fs.readFile)
const mkdir = promisify(fs.mkdir)

class Stream {
  constructor (pathToFile) {
    this.writeStream = fs.createWriteStream(pathToFile, { flags: 'a', encoding: 'utf-8' })
    this.lastUpdate = new Date()
  }

  write (data) {
    return new Promise((resolve, reject) => {
      if (!this.writeStream.write(data)) {
        this.writeStream.once('drain', () => {
          resolve()
        })
      } else resolve()
    })
  }
}

module.exports = {
  path,
  readFile,
  mkdir,
  Stream
}
