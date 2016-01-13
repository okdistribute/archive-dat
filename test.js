var archive = require('./')
var fs = require('fs')
var test = require('tape')
var concat = require('concat-stream')
var dat = require('dat')
var path = require('path')
var tar = require('tar-stream')

test('creates tar', function (t) {
  var db = dat()
  db.addFiles([path.join(__dirname, 'fixtures')], function (err, link) {
    t.ifError(err)
    archive.create(db, link, function (err, tar) {
      t.ifError(err)
      t.end()
    })
  })
})

test('check tar contents', function (t) {
  var db = dat()
  db.addFiles([path.join(__dirname, 'fixtures')], function (err, link) {
    t.ifError(err)
    archive.create(db, link, function (err, tar) {
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
    if (header.type === 'directory') {
      t.equals(header.name, 'folder')
    } else if (header.type === 'file') {
      stream.pipe(concat(function (data) {
        var csv = fs.readFileSync(path.join('fixtures', header.name)).toString()
        t.equals(csv, data.toString())
      }))
    }
    stream.resume()
  })

  extract.on('finish', function () {
    t.equals(total, 3)
    t.end()
  })
  return extract
}
