'use strict'

class Helpers {
// https://stackoverflow.com/a/55435856

  chunks (arr, n) {
    function * ch (arr, n) {
      for (let i = 0; i < arr.length; i += n) {
        yield (arr.slice(i, i + n))
      }
    }

    return [...ch(arr, n)]
  }
}

module.exports = Helpers
