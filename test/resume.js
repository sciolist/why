var test = require('tap').test;
var Y = require('../');


test('can resume from node-callbacks in generator functions ', function(t) {
  Y(function* () {
    var result = yield callback(false, Y());
    t.equal(result, 42, 'resume after node-callbacks');
    t.end();
  })().done();
});


test('can await multiple resumes from node-callbacks in generator functions ', function(t) {
  Y(function* () {
    var result = yield callback(false, Y(), Y(), Y(), Y());
    t.similar(result, [42, 43, 44, 45], 'resume after node-callbacks');
    t.end();
  })().done();
});


test('returned errors from resumes are thrown', function(t) {
  
  Y(function*() {
    var result = yield callback(true, Y());
  })().fail(function(err) {
    t.equal(err.message, 'USER_ERROR', 'error was thrown.');
    t.end();
  }).done();

});


test('ignoring resume value throws an error', function(t) {
  
  Y(function*() {
    Y();
  })().fail(function(err) {
    t.equal(err.code, 'WHY_UNUSED_CALLBACK', 'error was thrown');
    t.end();
  }).done();

});


test('can use Y.done() function to coax promise out of node-style callback', function(t) {
  
  Y(function*() {
    var values = yield [
      (callback(false, Y()), Y.done()),
      (callback(false, Y()), Y.done()),
      (callback(false, Y()), Y.done()),
      (callback(false, Y()), Y.done())
    ];

    t.similar(values, [42, 42, 42, 42], 'values should return in array.');
    t.end();
  })().done();

});

test('cant use Y.done() without a pending callback.', function(t) {
  
  Y(function*() {
    var value = yield callback(false, Y());
    Y.done();
    t.ok(false, 'error should have been thrown!');
    t.end();
  })().fail(function(err) {
    t.equal(err.code, 'WHY_INVALID_STATE_FOR_DONE', 'error was thrown! ' + err.message);
    t.end();
  }).done();

});


function callback(fail, cb1, cb2) {
  for(var i=1; i<arguments.length; ++i) {
    var cb = arguments[i];
    cb(fail ? new Error('USER_ERROR') : null, fail ? null : 41 + i);
  }
}

