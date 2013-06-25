var test = require('tap').test;
var Y = require('../');
var Q = require('q');


test('Y.run captures thrown exceptions', function(t) {
  var fn = Y(function*() { throw new Error('USER_ERROR'); });

  fn().fail(function(err) {
    t.equal(err.message, 'USER_ERROR', 'should return an error');
    t.end();
  }).done();
});

test('Y.run crashes on invalid yield', function(t) {
  var fn = Y(function*() { yield [Q.resolve(42), 'ok']; });

  fn().fail(function(err) {
    t.equal(err.code, 'WHY_TOPROMISE_FAILED', 'should return an error');
    t.end();
  }).done();
});


test('Y.run returns value to promise', function(t) {
  var fn = Y(function*() { return 42; });

  fn().then(function(v) {
    t.equal(v, 42, 'should return a value');
    t.end();
  }).done();
});

