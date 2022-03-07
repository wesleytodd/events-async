import {EventEmitter} from 'events';

export class AsyncEventEmitter extends EventEmitter {
	emit (type) {
		var options = {
			series: false,
			catch: false
		};
		let args = [].slice.call(arguments, 1);
		if (typeof type === 'object') {
			options.series = type.series;
			options.catch = type.catch;
			type = args.shift();
		}

		const events = this._events; // eslint-disable-line

		// Throw for unhandled errors
		if (!options.catch && type === 'error' && (!events || !events.error)) {
			const err = args[0];
			if (err instanceof Error) {
				throw err;
			} else {
				const e = new Error(`Uncaught, unspecified 'error' event. (${err})`);
				e.context = err;
				throw e;
			}
		}

		return new Promise((resolve, reject) => {
			// Throw for unhandled errors
			if (type === 'error' && (!events || !events.error)) {
				const err = args[0];
				if (err instanceof Error) {
					reject(err);
				} else {
					const e = new Error(`Uncaught, unspecified 'error' event. (${err})`);
					e.context = err;
					reject(e);
				}
			}

			let callbacks = events[type];
			if (!callbacks) {
				return resolve();
			}

			// helper function to reuse as much code as possible
			const run = (cb) => {
				switch (args.length) {
					// fast cases
				case 0:
					cb = cb.call(this);
					break;
				case 1:
					cb = cb.call(this, args[0]);
					break;
				case 2:
					cb = cb.call(this, args[0], args[1]);
					break;
				case 3:
					cb = cb.call(this, args[0], args[1], args[2]);
					break;
				// slower
				default:
					cb = cb.apply(this, args);
				}

				if (
					cb && (
						cb instanceof Promise ||
						typeof cb.then === 'function'
					)
				) {
					return cb;
				}

				return Promise.resolve(cb);
			};

			if (typeof callbacks === 'function') {
				run(callbacks).then(resolve, reject);
			} else if (typeof callbacks === 'object') {
				callbacks = callbacks.slice().filter(Boolean);
				if (options.series) {
					callbacks.reduce((prev, next) => {
						return prev.then((res) => {
							return run(next).then((result) => Promise.resolve(res.concat(result)));
						});
					}, Promise.resolve([])).then(resolve, reject);
				} else {
					Promise.all(callbacks.map(run)).then(resolve, reject);
				}
			}
		});
	}
}
