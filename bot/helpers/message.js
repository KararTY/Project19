async function createLog ({ message }) {

}

async function scanMessage ({ message }) {

}

// https://stackoverflow.com/a/55435856
function chunks (arr, n) {
  function * ch (arr, n) {
    for (let i = 0; i < arr.length; i += n) {
      yield (arr.slice(i, i + n))
    }
  }

  return [...ch(arr, n)]
}

module.exports = { createLog, scanMessage, chunks }
