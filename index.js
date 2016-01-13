var pump = require('pump')
var debug = require('debug')('archive-dat')
var through = require('through2')
var tar = require('tar-stream')

module.exports = {
  create: create
}

function create (dat, link, cb) {
  debug('creating archive for', link)
  dat.joinTcpSwarm(link, function (_err, link, port, close) {
    var feed = dat.drive.get(link) // the link identifies/verifies the content
    var feedStream = feed.createStream()
    var pack = tar.pack()
    var tarFiles = through.obj(function (entry, enc, next) {
      debug('got', entry)
      entry.value.type = entry.type
      entry.value.mtime = new Date(entry.value.mtime)
      entry.value.ctime = new Date(entry.value.ctime)
      var writeStream = pack.entry(entry.value, next)
      if (!entry.link) return writeStream.end()
      var content = dat.drive.get(entry)
      pump(content.createStream(), writeStream, function (err) {
        if (err) return cb(err)
        debug('next')
      })
    })

    pump(feedStream, tarFiles, function (err) {
      if (err) return cb(err)
      debug('done!')
      pack.finalize()
      close()
      return cb(null, pack)
    })
  })
}
