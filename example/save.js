var hyperlog = require('hyperlog')
var memdb = require('memdb')
var hdata = require('../')
var fs = require('fs')

var log = hyperlog(memdb())
log.createReadStream({ live: true })
  .pipe(hdata.save())
  .pipe(fs.createWriteStream('/tmp/log.data'))

var data = {
  A: { links: [], data: 'hello' },
  B: { links: ['A'], data: 'world' },
  C: { links: ['A'], data: 'zzz' },
  D: { links: ['B','C'], data: 'zing' },
}
var keys = Object.keys(data).sort()
var nodes = {}
;(function next (prev) {
  if (keys.length === 0) return
  var key = keys.shift()
  var links = data[key].links.map(function (link) { return nodes[link] })
  log.add(links, data[key].data, function (err, node) {
    if (err) return console.error(err)
    nodes[key] = node.key
    next()
  })
})(null)
