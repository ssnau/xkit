module.exports = function sleep(ms) {
  return {
    then: later(ms)
  }
}

function later(ms) {
  return function (fn) {
    setTimeout(fn, ms);
  }
}
