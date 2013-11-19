var when = require('when');
var slice = Array.prototype.slice;

module.exports = exports = function why(opts) {
  if(arguments.length === 0) {
    return exports.resume.apply(this, arguments);
  }
  return exports.create(opts);
}

exports.done = function done() {
  if(!exports.runningState || !exports.runningState.wrappedPromise) {
    throw error.INVALID_STATE_FOR_DONE();
  }
  var wrapped = exports.runningState.wrappedPromise;
  delete exports.runningState.wrappedPromise;
  return wrapped;
}

exports.create = function create(factory) {
  var wrapper = function wrapper() {
    var iterator = factory.apply(this, arguments);
    return exports.run(iterator);
  }
  wrapper.toString = function() {
    return 'why(' + factory.toString() + ')';
  }
  return wrapper;
};

exports.resume = function resume(throws) {
  var state = exports.runningState;
  var wrap = when.defer(), old = state.wrappedPromise;
  if(!old) { state.wrappedPromise = wrap.promise; }
  else {
    var list = state.wrappedPromise.list || [state.wrappedPromise];
    list.push(wrap.promise);
    state.wrappedPromise = when.all(list);
    state.wrappedPromise.list = list;
  }
  return function(err, result) {
    if(throws === false && arguments.length === 1) return wrap.resolve(err);
    else if(throws === false) return wrap.resolve(slice.call(arguments));
    else if(err) return wrap.reject(err);
    else if(arguments.length < 3) return wrap.resolve(result);
    else wrap.resolve(slice.call(arguments, 1));
  };
}

exports.run = function run(iterator) {
  var def      = when.defer()
    , state    = { wrappedPromise: undefined }
    , callback = next.bind(next, 'next')
    , errback  = next.bind(next, 'throw');

  next('next');
  return def.promise;
  function next(verb, value) {
    function verify() {
      if(state.wrappedPromise !== undefined) {
        throw error.UNUSED_CALLBACK();
      }
    }

    try {
      var promise, response, oldState = exports.runningState;
      verify();
      exports.runningState = state;
      try {
        response = iterator[verb](value);
        while (!response.done) {
          if(response.value === 'cb') response = iterator[verb](exports.resume(true));
          if(response.value === 'value') response = iterator[verb](exports.resume(false));
          else break;
        }
      } finally {
        exports.runningState = oldState;
      }
      if(response.done) {
        verify();
        return def.resolve(response.value);
      }
      var promised = exports.toPromise(response.value, false);
      if(state.wrappedPromise !== undefined) {
        promised = state.wrappedPromise;
        state.wrappedPromise = undefined;
      }
      verify();
      promised.then(callback, errback);
    } catch(ex) {
      def.reject(ex);
    }
  }
}

exports.toPromise = function toPromise(value, raiseError) {
  if(value) {
    if(isPromise(value)) { return value; }
    if(value.toPromise && value.toPromise instanceof Function) { return value.toPromise(); }
    if(isGenerator(value)) { return exports.addPromise(value, exports.run(value)); }
    if(isGeneratorFunction(value)) { return exports.addPromise(value, exports.create(value)); }
    if(Array.isArray(value)) { return when.all(value.map(exports.toPromise)); }
  }
  if(raiseError === false) return when.resolve(value);
  throw error.TOPROMISE_FAILED();
}

exports.addPromise = function addPromise(value, promise) {
  value.toPromise = function toPromise() { return promise; }
  return promise;
}

function isPromise(v) { return v && v.then && v.then instanceof Function; }
function isGenerator(v) { return v && Object.prototype.toString.call(v) === '[object Generator]'; }
function isGeneratorFunction(v) { return v && v.constructor && v.constructor.name === 'GeneratorFunction'; }

error('INVALID_STATE_FOR_DONE', 'Y.done can only be used right after wrapping a node-style callback!');
error('UNUSED_CALLBACK', 'expected node-style callback did not occur!');
error('TOPROMISE_FAILED', 'yield value must be a generator, promise or an array of generators or promises.');
function error(code, msg) {
  error[code] = function() {
    var err = new Error(msg + ' (WHY_' + code + ')');
    err.code = 'WHY_' + code;
    return err;
  }
}


