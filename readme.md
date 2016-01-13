# archive-dat

Turn a dat link into a tarball.

[![Travis](http://img.shields.io/travis/karissa/archive-dat.svg?style=flat)](https://travis-ci.org/karissa/archive-dat)

## Install

```
npm install archive-dat
```

## Usage

```js
var dat = require('dat')
var archive = require('archive-dat')

var db = dat()
var link = 'dat://5aa78bedb1a1c3677725882123b08a15f48538635039c3e2096b64a13ab694b5'

archive.create(db, link, function (err, tar) {
  if (err) throw err
  tar.pipe(process.stdout) // goes somewhere!
})
```
