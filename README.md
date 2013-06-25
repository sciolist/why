# why

Why makes working with promises, generators and node-style callback a bit less of a drag!

Requires node v0.11+ with the `--harmony-generators` flag!

## Installation

```
$ npm install why
```

## Examples

```js
var Y = require('why');
var fs = require('fs');

var sizeOf = Y(function *(name) {
  // add Y() in place of a callback to use node-style functions.
  return (yield fs.stat(name, Y())).size;
});

var sizesOf = Y(function *(names) {
  // generators, promises, and arrays can be yielded directly.
  return yield names.map(function* (name) {
    return [name, yield sizeOf(name)];
  });
});

// Y()-wrapped generators return promises.
sizesOf(['index.js'])
  .then(function(value) { console.log(value); }) // [[ 'index.ejs', 2979 ]]
  .done();
```

