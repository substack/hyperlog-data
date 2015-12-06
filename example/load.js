var hyperlog = require('hyperlog')
var memdb = require('memdb')
var hdata = require('../')
var fs = require('fs')

var log = hyperlog(memdb())
fs.createReadStream('/tmp/log.data')
  .pipe(hdata.load(log))

log.createReadStream({ live: true })
  .on('data', console.log)
