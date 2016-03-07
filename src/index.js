import {EventEmitter} from 'events';

export class AsyncEventEmitter extends EventEmitter {
	emit (type) {
		var args = arguments;
		var evts = this._events;

		// Throw for unhandled errors
		if (type === 'error' && (!evts || !evts.error)) {
			var err = args[1];
			if (err instanceof Error) {
				throw err;
			} else {
				var e = new Error('Uncaught, unspecified "error" event. (' + err + ')');
				e.context = err;
				throw e;
			}
		}

		var handler = evts[type];
		if (!handler) {
			return Promise.resolve();
		}

		var isFn = typeof handler === 'function';
		switch (args.length) {
		case 1:
			return emitNone(handler, isFn, this);
		case 2:
			return emitOne(handler, isFn, this, args[1]);
		case 3:
			return emitTwo(handler, isFn, this, args[1], args[2]);
		case 4:
			return emitThree(handler, isFn, this, args[1], args[2], args[3]);
		default:
			var len = args.length;
			var a = new Array(len - 1);
			for (let i = 1; i < len; i++) {
				a[i - 1] = args[i];
			}
			return emitMany(handler, isFn, this, a);
		}
	}
}

function emitNone (handler, isFn, self) {
	if (isFn) {
		var p = handler.call(self);
		return (p instanceof Promise) ? p : Promise.resolve();
	} else {
		var len = handler.length;
		var listeners = arrayClone(handler, len);
		var promises = new Array(len);
		for (let i = 0; i < len; ++i) {
			promises[i] = listeners[i].call(self);
		}
		return Promise.all(promises.filter(function (p) {
			if (p instanceof Promise) {
				return true;
			}
			return false;
		}));
	}
}

function emitOne (handler, isFn, self, arg1) {
	if (isFn) {
		var p = handler.call(self, arg1);
		return (p instanceof Promise) ? p : Promise.resolve();
	} else {
		var len = handler.length;
		var listeners = arrayClone(handler, len);
		var promises = new Array(len);
		for (let i = 0; i < len; ++i) {
			promises[i] = listeners[i].call(self, arg1);
		}
		return Promise.all(promises.filter(function (p) {
			if (p instanceof Promise) {
				return true;
			}
			return false;
		}));
	}
}

function emitTwo (handler, isFn, self, arg1, arg2) {
	if (isFn) {
		var p = handler.call(self, arg1, arg2);
		return (p instanceof Promise) ? p : Promise.resolve();
	} else {
		var len = handler.length;
		var listeners = arrayClone(handler, len);
		var promises = new Array(len);
		for (let i = 0; i < len; ++i) {
			promises[i] = listeners[i].call(self, arg1, arg2);
		}
		return Promise.all(promises.filter(function (p) {
			if (p instanceof Promise) {
				return true;
			}
			return false;
		}));
	}
}

function emitThree (handler, isFn, self, arg1, arg2, arg3) {
	if (isFn) {
		var p = handler.call(self, arg1, arg2, arg3);
		return (p instanceof Promise) ? p : Promise.resolve();
	} else {
		var len = handler.length;
		var listeners = arrayClone(handler, len);
		var promises = new Array(len);
		for (let i = 0; i < len; ++i) {
			promises[i] = listeners[i].call(self, arg1, arg2, arg3);
		}
		return Promise.all(promises.filter(function (p) {
			if (p instanceof Promise) {
				return true;
			}
			return false;
		}));
	}
}

function emitMany (handler, isFn, self, args) {
	if (isFn) {
		var p = handler.apply(self, args);
		return (p instanceof Promise) ? p : Promise.resolve();
	} else {
		var len = handler.length;
		var listeners = arrayClone(handler, len);
		var promises = new Array(len);
		for (let i = 0; i < len; ++i) {
			promises[i] = listeners[i].apply(self, args);
		}
		return Promise.all(promises.filter(function (p) {
			if (p instanceof Promise) {
				return true;
			}
			return false;
		}));
	}
}

function arrayClone (arr, i) {
	var copy = new Array(i);
	while (i--) {
		copy[i] = arr[i];
	}
	return copy;
}
