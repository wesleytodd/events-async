/* global describe, it */
var assert = require('assert');
var EventEmitter = require('../');

describe('AsyncEventEmitter', function () {
	for (var i = 0; i < 5; i++) {
		(function (i) {
			it('should emit events with ' + i + ' arguments', function (done) {
				var ee = new EventEmitter();

				ee.on('evt', function () {
					arguments.length && assert(arguments[i - 1] === i);
					return new Promise(function (resolve) {
						setTimeout(function () {
							resolve();
						}, 10);
					});
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
					return new Promise(function (resolve) {
						setTimeout(function () {
							resolve();
						}, 10);
					});
				});
				ee.on('evt', function () {
					arguments.length && assert(arguments[i - 1] === i);
					return new Promise(function (resolve) {
						setTimeout(function () {
							resolve();
						}, 10);
					});
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
});
