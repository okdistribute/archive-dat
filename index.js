var pump = require('pump')
var debug = require('debug')('archive-dat')
var through = require('through2')
var tar = require('tar-stream')

module.exports = function create (archive, cb) {
  var pack = tar.pack()
  var tarFiles = through.obj(function (entry, enc, next) {
    debug('got', entry)
    entry.mtime = new Date(entry.mtime)
    entry.ctime = new Date(entry.ctime)
    entry.size = entry.length
    var writeStream = pack.entry(entry, function () {
      debug('write stream end')
    })
    var content = archive.createFileReadStream(entry)
    pump(content, writeStream, function (err) {
      if (err) return cb(err)
      debug('next')
      next()
    })
  })

  pump(archive.list(), tarFiles, function (err) {
    if (err) return cb(err)
    debug('done!')
    pack.finalize()
    return cb(null, pack)
  })
}
