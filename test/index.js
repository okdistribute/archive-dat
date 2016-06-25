var archiveit = require('..')
var fs = require('fs')
var raf = require('random-access-file')
var test = require('tape')
var concat = require('concat-stream')
var hyperdrive = require('hyperdrive')
var path = require('path')
var memdb = require('memdb')
var tar = require('tar-stream')

test('check tar contents', function (t) {
  var drive = hyperdrive(memdb())
  var archive = drive.createArchive()
  var ws = archive.createFileWriteStream('hello.txt')

  ws.write('hello')
  ws.write('world')
  ws.end()

  archive.finalize(function () {
    t.ok(archive.key.toString('hex'))
    archiveit(archive, function (err, tar) {
      t.ifError(err)
      var extract = extractor(t)
      tar.pipe(extract)
    })
  })
})

function extractor (t) {
  var total = 0
  var extract = tar.extract()
  extract.on('entry', function (header, stream, callback) {
    stream.on('end', function () {
      total += 1
      callback()
    })
    if (header.type === 'file') {
      t.equals(header.name, 'hello.txt')
      stream.pipe(concat(function (data) {
        t.equals('helloworld', data.toString())
      }))
    }
    stream.resume()
  })

  extract.on('finish', function () {
    t.equals(total, 1)
    t.end()
  })
  return extract
}
