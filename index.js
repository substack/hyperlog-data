var through = require('through2')
var lenpre = require('length-prefixed-stream')
var combine = require('stream-combiner2')
var messages = require('hyperlog/lib/messages.js')

exports.save = function () {
  return combine.obj([ through.obj(write), lenpre.encode() ])

  function write (row, enc, next) {
    try { var buf = messages.Node.encode(row) }
    catch (err) { return next(err) }
    next(null, buf)
  }
}

exports.load = function (log, cb) {
  var decode = lenpre.decode()
  decode.pipe(through.obj(write, end))
    .on('error', function (err) {
      if (cb) cb(err)
      else decode.emit('error', err)
    })
  return decode

  function write (buf, enc, next) {
    try { var row = messages.Node.decode(buf) }
    catch (err) { return next(err) }
    log.add(row.links, row.value, row, function (err) { next(err) })
  }
  function end () {
    decode.emit('end')
    if (cb) cb(null)
  }
}
