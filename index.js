var Q = require('q');

module.exports = exports = function Y(opts) {
  if(arguments.length === 0) {
    return exports.resume.apply(this, arguments);
  }
  return exports.create(opts);
}

exports.done = function done() {
  if(!exports.runningState || !exports.runningState.wrappedPromise) {
    throw error('INVALID_STATE_FOR_DONE');
  }
  var wrapped = exports.runningState.wrappedPromise;
  delete exports.runningState.wrappedPromise;
  return wrapped;
}

exports.create = function create(factory) {
  return function wrapper() {
    var iterator = factory.apply(this, arguments);
    var promise = exports.run(iterator);
    
    var result = function result(cb) {
      promise
        .fail(function(err) { cb(err); })
        .then(function(v) { cb(null, v); });
    }
    result.__proto__ = promise;
    return result;
  }
};

exports.resume = function resume(throws) {
  var state = exports.runningState;
  var wrap = Q.defer(), old = state.wrappedPromise;
  if(!old) { state.wrappedPromise = wrap.promise; }
  else {
    var list = state.wrappedPromise.list || [state.wrappedPromise];
    list.push(wrap.promise);
    state.wrappedPromise = Q.all(list);
    state.wrappedPromise.list = list;
  }
  return function(err, result) {
    if(throws === false) { result = err; err = null; }
    if(err) return wrap.reject(err);
    if(arguments.length === 2) return wrap.resolve(result);
    var args = Array.prototype.slice.call(arguments, 1);
    wrap.resolve(args);
  };
}

exports.run = function run(iterator) {
  var def      = Q.defer()
    , state    = { wrappedPromise: undefined }
    , callback = next.bind(next, 'send')
    , errback  = next.bind(next, 'throw');

  next('send');
  return def.promise;
  function next(verb, value) {
    function verify() {
      if(state.wrappedPromise !== undefined) {
        throw error('UNUSED_CALLBACK');
      }
    }

    try {
      var promise, response, oldState = exports.runningState;
      verify();
      exports.runningState = state;
      try {
        response = iterator[verb](value);
      } finally {
        exports.runningState = oldState;
      }
      if(response.done) {
        verify();
        return def.resolve(response.value);
      }
      var promised = exports.toPromise(response.value, false);
      if(state.wrappedPromise !== undefined && promised === undefined) {
        promised = state.wrappedPromise;
        state.wrappedPromise = undefined;
      }
      verify();
      promised.then(callback).fail(errback);
    } catch(ex) {
      def.reject(ex);
    }
  }
}

exports.toPromise = function toPromise(value, raiseError) {
  if(value) {
    if(isPromise(value)) { return value; }
    if(isGenerator(value)) { return exports.run(value); }
    if(isGeneratorFunction(value)) { return exports.create(value)(); }
    if(Array.isArray(value)) { return Q.all(value.map(exports.toPromise)); }
  }
  if(raiseError === false) return;
  throw error('TOPROMISE_FAILED');
}

function isPromise(v) { return v && v.then && v.then.call; }
function isGenerator(v) { return v && Object.prototype.toString.call(v) === '[object Generator]'; }
function isGeneratorFunction(v) { return v && v.constructor && v.constructor.name === 'GeneratorFunction'; }

function error(code) {
  var msg = "";
  switch(code) {
    case 'INVALID_STATE_FOR_DONE': msg = "Y.done can only be used right after wrapping a node-style callback!"; break;
    case 'UNUSED_CALLBACK': msg = 'expected node-style callback did not occur!'; break;
    case 'TOPROMISE_FAILED': msg = "yield value must be a generator, promise or an array of generators or promises."; break;
    default: msg = "Unknown error"; break;
  }
  var err = new Error(msg + ' (WHY_' + code + ')');
  err.code = 'WHY_' + code;
  return err;
}

