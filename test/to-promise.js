var test = require('tap').test;
var Y = require('../');
var when = require('when');


test('Y.toPromise(promise) returns a promise', function(t) {
  var promise = when.resolve(42);
  var value = Y.toPromise(promise);
  value.then(function(v) {
    t.equal(v, 42);
    t.end();
  });
});


test('Y.toPromise(generatorFunction) returns a promise', function(t) {
  var value = Y.toPromise(generator);
  value.then(function(v) {
    t.equal(v, 42);
    t.end();
  });
});


test('Y.toPromise(generator) returns a promise', function(t) {
  var value = Y.toPromise(generator());
  value.then(function(v) { 
    t.equal(v, 42);
    t.end();
  });
});


test('Y.toPromise(array) returns a promise', function(t) {
  var promise = when.resolve(40);
  var value = Y.toPromise([promise, generator(1), generator], true);
  value.then(function(v) {
    t.similar(v, [40, 41, 42], 'array should return inner values in order.');
    t.end();
  });
});


test('Y.toPromise(otherValue) throws an error', function(t) {
  try {
    Y.toPromise(undefined);
  } catch(ex) {
    t.equal(ex.code, 'WHY_TOPROMISE_FAILED', 'toPromise on other values should throw an error if raiseError parameter passed.');
    t.end();
  }
});


function *generator(v) { return 42 - (v|0); }

