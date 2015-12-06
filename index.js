var through = require('through2')

module.exports = function () {
  return through.obj(write)

  function write (row, enc, next) {
    console.log(row)
    next()
  }
}
