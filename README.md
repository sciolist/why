# why

Why makes working with promises, generators and node-style callback a bit less of a drag!

Requires node v0.11+ with the `--harmony-generators` flag!

## Installation

```
$ npm install why
```

## Example

```js
var Y = require('why');
var fs = require('fs');

var stat = Y(function *(name) {
  // add Y() in place of a callback to use node-style functions.
  return yield fs.stat(name, Y());
});

var sizesOf = Y(function *(names) {
  // generators, promises, and arrays can be yielded directly.
  return yield names.map(function* (name) {
    return [name, (yield stat(name)).size];
  });
});

// Y()-wrapped generators return promises.
sizesOf(['index.js'])
  .then(function(value) { console.log(value); }) // [[ 'index.js', 3784 ]]
  .done();
```

