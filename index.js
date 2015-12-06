var through = require('through2')
var lenpre = require('length-prefixed-stream')
var combine = require('stream-combiner2')

var messages = require('hyperlog/lib/messages.js')
var hyperlog = require('hyperlog')

exports.save = function () {
  return combine([ through.obj(write), lenpre() ])

  function write (row, enc, next) {
    try { var buf = messages.Node.encode(row) }
    catch (err) { return next(err) }
    next(null, buf)
  }
}

exports.load = function () {
  return combine([ lenpre(), through.obj(write) ])

  function write (buf, enc, next) {
    try { var row = messages.Node.decode(buf) }
    catch (err) { return next(err) }
    next(null, row)
  }
}
