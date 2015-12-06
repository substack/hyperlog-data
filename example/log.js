var hyperlog = require('hyperlog')
var memdb = require('memdb')
var serialize = require('../')
var fs = require('fs')

var log = hyperlog(memdb())
fs.stat('/tmp/log.data', function (err, stat) {
  log.createReadStream({ live: true })
    .pipe(serialize())
    .pipe(fs.createWriteStream({
      flags: 'r+',
      start: (stat || {}).size
    }))
})

var data = {
  A: { links: [], data: 'hello' },
  B: { links: ['A'], data: 'world' },
  C: { links: ['A'], data: 'zzz' },
  D: { links: ['B','C'], data: 'zing' },
}
var keys = Object.keys(data).sort()
;(function next (prev) {
  if (keys.length === 0) return
  var key = keys.shift()
  log.add(prev, function (err, node) {
    if (err) console.error(err)
    else next(node.key)
  })
})(null)
