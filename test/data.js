var test = require('tape')
var hyperlog = require('hyperlog')
var memdb = require('memdb')
var hdata = require('../')
var fs = require('fs')
var tmpdir = require('os').tmpdir()
var path = require('path')
var collect = require('collect-stream')

var tmpfile = path.join(tmpdir, 'hyperlog-data-test-' + Math.random())

test('data', function (t) {
  t.plan(3)
  var log0 = hyperlog(memdb())

  var data = {
    A: { links: [], data: 'hello' },
    B: { links: ['A'], data: 'world' },
    C: { links: ['A'], data: 'zzz' },
    D: { links: ['B','C'], data: 'zing' },
  }
  var keys = Object.keys(data).sort()
  var nodes = {}
  ;(function next (prev) {
    if (keys.length === 0) return populate()
    var key = keys.shift()
    var links = data[key].links.map(function (link) { return nodes[link] })
    log0.add(links, data[key].data, function (err, node) {
      if (err) return console.error(err)
      nodes[key] = node.key
      next()
    })
  })(null)

  function populate () {
    log0.createReadStream()
      .pipe(hdata.save())
      .pipe(fs.createWriteStream(tmpfile))
      .once('finish', load)
  }

  function load () {
    var log1 = hyperlog(memdb())
    fs.createReadStream(tmpfile)
      .pipe(hdata.load(log1, function (err) {
        t.ifError(err)
        collect(log1.createReadStream(), compare)
      }))

    function compare (err, rows) {
      t.ifError(err)
      t.deepEqual(
        rows.map(function (row) { return row.value.toString() }),
        [ 'hello', 'world', 'zzz', 'zing' ]
      )
    }
  }
})
