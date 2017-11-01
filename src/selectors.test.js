import {collapseSelectorsUpToChunkSize, getSelectorWithIdPrefix} from './selectors';

describe('#getSelectorWithIdPrefix', () => {
  it('should export getSelectorWithIdPrefix function', () => {
    expect(getSelectorWithIdPrefix).toBeInstanceOf(Function);
  });

  it('should return as it is if no id prefix', () => {
    const selector = getSelectorWithIdPrefix({a: 1});
    expect(selector).toEqual({a: 1});
  });

  it('should return w/ id prefix regex if present', () => {
    const selector = getSelectorWithIdPrefix({a: 1}, 'a');
    expect(selector).toEqual({_id: {$regex: '^a', $options: 'i'}, a: 1});
  });
});

describe('#collapseSelectorsUpToChunkSize', () => {
  it('should export collapseSelectorsUpToChunkSize function', () => {
    expect(collapseSelectorsUpToChunkSize).toBeInstanceOf(Function);
  });

  it('should return as it is for 1 selector', () => {
    const selectors = collapseSelectorsUpToChunkSize([{_id: 'a', count: 10}], 100);
    expect(selectors).toEqual([{_id: 'a', count: 10}]);
  });

  it('should return 2 queries collapsed if under chunk size', () => {
    const selectors = collapseSelectorsUpToChunkSize([
      {_id: 'a', count: 10},
      {_id: 'b', count: 20},
    ], 100);

    expect(selectors).toEqual([{_id: 'a|^b', count: 30}]);
  });

  it('should return 2 small and 1 big into 2 normal', () => {
    const selectors = collapseSelectorsUpToChunkSize([
      {_id: 'a', count: 10},
      {_id: 'b', count: 20},
      {_id: 'c', count: 200},
    ], 100);

    expect(selectors).toEqual([
      {_id: 'a|^b', count: 30},
      {_id: 'c', count: 200}
    ]);
  });

  it('should return 3 small into 1 normal', () => {
    const selectors = collapseSelectorsUpToChunkSize([
      {_id: 'a', count: 10},
      {_id: 'b', count: 20},
      {_id: 'c', count: 10},
    ], 100);

    expect(selectors).toEqual([
      {_id: 'a|^c|^b', count: 40}
    ]);
  });

  it('should return 3 small into 1 normal when big is in the middle', () => {
    const selectors = collapseSelectorsUpToChunkSize([
      {_id: 'a', count: 10},
      {_id: 'b', count: 20},
      {_id: 'z', count: 2000},
      {_id: 'c', count: 10},
    ], 100);

    expect(selectors).toEqual([
      {_id: 'a|^c|^b', count: 40},
      {_id: 'z', count: 2000}
    ]);
  });

  it('should return 5 big untouched', () => {
    const selectors = collapseSelectorsUpToChunkSize([
      {_id: 'a', count: 1000},
      {_id: 'b', count: 2090},
      {_id: 'z', count: 2000},
      {_id: 'c', count: 1000},
    ], 100);

    expect(selectors).toEqual([
      {_id: 'a', count: 1000},
      {_id: 'c', count: 1000},
      {_id: 'z', count: 2000},
      {_id: 'b', count: 2090},
    ]);
  });
});
