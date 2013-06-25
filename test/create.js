var test = require('tap').test;
var Y = require('../');


test('Y.create(fn) creates a promise factory', function(t) {
  var factory = Y.create(generator);
  factory().then(function(v) {
    t.equal(v, 42, 'generator ran correctly');
    t.end();
  }).done();
});


test('Y.create(fn) can also use callbacks', function(t) {
  var factory = Y.create(generator);
  factory()(function(err, value) {
    t.equal(value, 42, 'callback invoked');
    t.end();
  });
});


function *generator() { return 42; }

