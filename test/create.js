var test = require('tap').test;
var Y = require('../');


test('Y.create(fn) creates a promise factory', function(t) {
  var factory = Y.create(generator);
  factory().then(function(v) {
    t.equal(v, 42, 'generator ran correctly');
    t.end();
  });
});


function *generator() { return 42; }

