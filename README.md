# Events, but asynchronous

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status](https://travis-ci.org/wesleytodd/events-async.svg?branch=master)](https://travis-ci.org/wesleytodd/events-async)
[![js-happiness-style](https://img.shields.io/badge/code%20style-happiness-brightgreen.svg)](https://github.com/JedWatson/happiness)

[npm-image]: https://img.shields.io/npm/v/events-async.svg
[npm-url]: https://npmjs.org/package/events-async
[downloads-image]: https://img.shields.io/npm/dm/events-async.svg
[downloads-url]: https://npmjs.org/package/events-async

This module is the lightest wrapper I could come up with around the `EventEmitter` to add support for async events with Promises.  It only re-implements the `emit` method.  This now returns a `Promise` which will be resolved when all the event handlers have completed.

Handler functions can return a `Promise` to indicate that they are asynchronous which will then wait for resolution before emit resolves.

## Install

```
$ npm install --save events-async
```

## Usage

```javascript
var EventEmitter = require('events-async');

var ee = new EventEmitter();

// Add an asyncronous listener
ee.on('evt', function () {
	return new Promise(function (resolve, reject) {
		// Do something async, for example:
		process.nextTick(function () {
			resolve();
		});
	});
});

// Emit an event and wait for it to complete
ee.emit('evt').then(function () {
	// All of the listeners have run
});
```

With this module you can mix async listeners and sync listeners, so you are not tied to the promise interface when you don't need it.  Listeners that don't return a promise are just run in the normal sync fashion.

This module also supports the same argument passing behavior as node core's `EventEmitter`.  It is actually as close to a direct port for that as possible, including the performance optimizations.


By default handler functions are run in parallel. If you need to run them in a series the first argument of the emit function needs to be an object with the `series` option passed.


```javascript
var EventEmitter = require('events-async');
var delay = require('delay');
var actual = [];

var ee = new EventEmitter();

// first
ee.on('evt', function () {
	return delay(300).then(function () {
			actual.push(300);
		});
});

// second
ee.on('evt', function () {
	return delay(200).then(function () {
			actual.push(200);
		});
});

// third
ee.on('evt', function () {
	return delay(100).then(function () {
			actual.push(100);
		});
});

// Emit an event and wait for it to complete
ee.emit({ serial: true }, 'evt').then(function () {
	// All of the listeners have run
	console.log(actual);
	//=> [ 300, 200, 100 ]
});
```


If you want to catch an error instead of it throwing a hard error then pass `{ catch: true }` into the emit options.
