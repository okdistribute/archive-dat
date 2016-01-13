var pump = require('pump')
var through = require('through2')
var tar = require('tar-stream')

module.exports = {
  create: create
}

function create (dat, link, cb) {
  dat.joinTcpSwarm(link, function (err, link, port, close) {
    if (err) throw err
    var feed = dat.drive.get(link) // the link identifies/verifies the content
    var feedStream = feed.createStream()
    var pack = tar.pack()
    var tarFiles = through.obj(function (entry, enc, next) {
      entry.value.type = entry.type
      entry.value.mtime = new Date(entry.value.mtime)
      entry.value.ctime = new Date(entry.value.ctime)
      var writeStream = pack.entry(entry.value, next)
      if (!entry.link) return writeStream.end()
      var content = dat.drive.get(entry)
      pump(content.createStream(), writeStream, function (err) {
        if (err) next(err)
      })
    })

    pump(feedStream, tarFiles, function (err) {
      if (err) return cb(err)
      pack.finalize()
      close()
      return cb(null, pack)
    })
  })
}
