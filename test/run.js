var test = require('tap').test;
var Y = require('../');
var when = require('when');


test('Y.run captures thrown exceptions', function(t) {
  var fn = Y(function*() { throw new Error('USER_ERROR'); });

  fn().then(function(){}, function(err) {
    t.equal(err.message, 'USER_ERROR', 'should return an error');
    t.end();
  });
});

test('Y.run crashes on invalid yield', function(t) {
  var fn = Y(function*() { yield [when.resolve(42), 'ok']; });

  fn().then(function(){}, function(err) {
    t.equal(err.code, 'WHY_TOPROMISE_FAILED', 'should return an error');
    t.end();
  });
});


test('Y.run returns value to promise', function(t) {
  var fn = Y(function*() { return 42; });

  fn().then(function(v) {
    t.equal(v, 42, 'should return a value');
    t.end();
  });
});

test('Y.run wrapped generators should be reusable', function(t) {
  var fn1 = function*() {};
  Y(function*() {
    var wait = fn1();
    yield [wait, wait];
    t.end();
  })().then(null, console.error);
});
