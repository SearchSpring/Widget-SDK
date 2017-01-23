let Chunk = require('./Chunk');

describe('Chunk', () => {
	let chunk;

	function reset() {
		chunk = new Chunk();
	}

	beforeEach(() => reset());

	it('starts with emply state', () => {
		expect(chunk.get().length).toBe(0);
	});

	it('can get added values', () => {
		chunk.add('test', 'val');

		expect(chunk.get().length).toEqual(1);

		chunk.add('test2', 'val');

		expect(chunk.get().length).toEqual(2);
	});

	it('gets nested values', () => {
		chunk.add('key', 'val');

		expect(chunk.get()).toEqual([['key', 'val']]);
		expect(chunk.get('key')).toEqual([['key', 'val']]);

		reset();

		chunk.add('filter', 'ss_sizes_unique', 1);
		expect(chunk.get('filter', 'ss_sizes_unique', 1).length).toBe(1);
	});

	it('gets nested with multiple values', () => {
		chunk.add('key', 'val1');
		chunk.add('key', 'val2');

		expect(chunk.get()).toEqual([['key', 'val1'], ['key', 'val2']]);
		expect(chunk.get('key')).toEqual([['key', 'val1'], ['key', 'val2']]);
		expect(chunk.get('key', 'val1')).toEqual([[ 'key', 'val1' ]]);

		reset();

		chunk.add('key', 'val', 'nested1');
		chunk.add('key', 'val', 'nested2');

		expect(chunk.get()).toEqual([['key', 'val', 'nested1'], ['key', 'val', 'nested2']]);
		expect(chunk.get('key')).toEqual([['key', 'val', 'nested1'], ['key', 'val', 'nested2']]);
		expect(chunk.get('key', 'val')).toEqual([['key', 'val', 'nested1'], ['key', 'val', 'nested2']]);
	});

	it('can remove values', () => {
		chunk.add('key', 'val', 'nested1');
		chunk.add('key', 'val', 'nested2');
		chunk.add('key', 'val2', 'nested3');

		chunk.remove('key', 'val', 'nested2');
		expect(chunk.get()).toEqual([['key', 'val', 'nested1'], [ 'key', 'val2', 'nested3' ]]);

		chunk.remove('key', 'val');
		expect(chunk.get()).toEqual([[ 'key', 'val2', 'nested3' ]]);

		chunk.remove('key');
		expect(chunk.get().length).toBe(0);

		chunk.add('one', 'two', 'three');
		chunk.add('four', 'five', 'six');
		chunk.remove();
		expect(chunk.get().length).toBe(0);

		reset();

		chunk.add('filter', 'size', 'wat');
		chunk.remove('filter', 'size', 'wat');
		expect(chunk.get().length).toBe(0);
	});

	it('imports state', () => {
		let chunk = new Chunk({ foo: 1, bar: { baz: 'sham', from: 'where', bool: false } });

		expect(chunk.get()).toEqual([['foo', 1], ['bar', 'baz', 'sham'], ['bar', 'from', 'where'], ['bar', 'bool', false]]);
	});

	it('impletements toState correctly', () => {
		chunk.add('key', 'val1', 'subval1');
		chunk.add('key', 'val1', 'subval2');

		chunk.add('key', 'val2', 'subval1');
		chunk.add('key', 'val2', 'subval2');

		chunk.add('key', 'val3', 'subval1');

		chunk.add('another', 'thing');

		let state = chunk.toState();
		//	{
		//		key: {
		//			val1: [ 'subval1', 'subval2' ],
		//			val2: [ 'subval1', 'subval2' ],
		//			val3: [ 'subval1' ]
		//		},
		//		another: [ 'thing' ]
		//	}

		expect(state.key.val1).toEqual(['subval1', 'subval2']);
		expect(state.key.val2).toEqual(['subval1', 'subval2']);
		expect(state.another).toEqual(['thing']);
	});

	//it('throws if add less than 2 parameters', () => {
	//	expect(chunk.add.bind(chunk)).toThrow();
	//	expect(chunk.add.bind(chunk, 'test')).toThrow();
	//});

	//it('throws if adding to occupied path', () => {
	//	chunk.add('key', 'val', 'subval');

	//	expect(chunk.add.bind(chunk, 'key', 'val')).toThrow();
	//	expect(chunk.add.bind(chunk, 'key', 'val', 'subval', 'wtfisthis')).toThrow();
	//});
});
