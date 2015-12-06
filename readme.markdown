# hyperlog-data

save/load a hyperlog to/from a stream of bytes

# example

## save

save a hyperlog to a stream of bytes for external storage:

``` js
var hyperlog = require('hyperlog')
var memdb = require('memdb')
var hdata = require('hyperlog-data')
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
```

## load

populate a hyperlog with previously exported data from a stream of bytes:

``` js
var hyperlog = require('hyperlog')
var memdb = require('memdb')
var hdata = require('hyperlog-data')
var fs = require('fs')

var log = hyperlog(memdb())
fs.createReadStream('/tmp/log.data')
  .pipe(hdata.load(log))

log.createReadStream({ live: true })
  .on('data', console.log)
```

# api

``` js
var hdata = require('hyperlog-data')
```

## var stream = hdata.save()

Return a transform object `stream` that reads rows from a hyperlog's
`createReadStream()` and outputs bytes.

## var stream = hdata.load(log)

Return a readable `stream` that reads bytes from an exported hyperlog and
populates `log` with the data.

# install

```
npm install hyperlog-data
```

# license

BSD
