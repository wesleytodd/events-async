/* global describe, it */
var assert = require('assert');
var EventEmitter = require('../');

function delay (time) {
	return new Promise(function (resolve) {
		setTimeout(resolve, time || 100);
	});
}

describe('AsyncEventEmitter', function () {
	for (var i = 0; i < 5; i++) {
		(function (i) {
			it('should emit events with ' + i + ' arguments', function (done) {
				var ee = new EventEmitter();

				ee.on('evt', function () {
					arguments.length && assert(arguments[i - 1] === i);
					return delay(10);
				});

				var args = ['evt'];
				for (var ii = 0; ii < i; ii++) {
					args[ii + 1] = i;
				}

				ee.emit.apply(ee, args).then(function () {
					done();
				});
			});
		})(i);
	}

	for (var j = 0; j < 5; j++) {
		(function (i) {
			it('should emit events with ' + i + ' arguments with multiple listeners', function (done) {
				var ee = new EventEmitter();

				ee.on('evt', function () {
					arguments.length && assert(arguments[i - 1] === i);
					return delay(10);
				});
				ee.on('evt', function () {
					arguments.length && assert(arguments[i - 1] === i);
					return delay(10);
				});

				var args = ['evt'];
				for (var ii = 0; ii < i; ii++) {
					args[ii + 1] = i;
				}

				ee.emit.apply(ee, args).then(function () {
					done();
				});
			});
		})(j);
	}

	it('should emit events which do not return promises', function (done) {
		var ee = new EventEmitter();

		ee.on('evt', function () {
			arguments.length && assert(arguments[i - 1] === i);
		});
		ee.on('evt', function () {
			arguments.length && assert(arguments[i - 1] === i);
		});

		ee.emit('evt').then(function () {
			done();
		});
	});

	it('should resolve with no handlers are present', function (done) {
		var ee = new EventEmitter();
		ee.emit('evt').then(function () {
			done();
		});
	});

	it('should throw when an uncaught error occurs', function () {
		var ee = new EventEmitter();
		assert.throws(function () {
			ee.emit('error', new Error('foo'));
		}, /foo/);
		assert.throws(function () {
			ee.emit('error');
		}, /Uncaught/);
	});

	it('should catch error and return promise when a error constructor is passed', function (done) {
		var ee = new EventEmitter();
		ee.emit({ catch: true }, 'error', new Error('foo'))
			.then(function () {
				assert.fail('should have thrown an error');
				done();
			})
			.catch(function (err) {
				assert.ok(/Error: foo/.test(err));
				done();
			});
	});

	it('should catch error and return promise when an uncaught error occurs', function (done) {
		var ee = new EventEmitter();
		ee.emit({ catch: true }, 'error')
			.then(function () {
				assert.fail('should have thrown an error');
				done();
			})
			.catch(function (err) {
				assert.ok(/Uncaught/.test(err));
				done();
			});
	});

	it('should emit events serially', function (done) {
		var actual = [];
		var expected = [ 40, 30, 20, 10 ];
		var ee = new EventEmitter();

		[ 40, 30, 20, 10 ].forEach(function (n) {
			ee.on('test', function () {
				return delay(n)
				.then(function () {
					actual.push(n);
					return n;
				});
			});
		});

		ee.emit({ series: true }, 'test')
			.then(function (result) {
				assert.deepEqual(result, expected);
				assert.deepEqual(actual, expected);
				done();
			})
			.catch(function (err) {
				assert.fail(err);
				done();
			});
	});

	it('should emit events async', function (done) {
		var actual = [];
		var expected = [ 10, 20, 30, 40 ];
		var ee = new EventEmitter();

		[ 40, 30, 20, 10 ].forEach(function (n) {
			ee.on('test', function () {
				return delay(n)
				.then(function () {
					actual.push(n);
					return n;
				});
			});
		});

		ee.emit('test')
			.then(function (result) {
				assert.deepEqual(actual, expected);
				// result should still be the same order as it was called
				assert.deepEqual(result.reverse(), expected);
				done();
			})
			.catch(function (err) {
				assert.fail(err);
				done();
			});
	});
});
