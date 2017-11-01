jest.mock('./mongo');

import {aggregateIdPrefixes, getCountBySelector} from './mongo';
import {chunkQuery} from '.';

it('should export chunkQuery function', () => {
  expect(chunkQuery).toBeInstanceOf(Function);
});

describe('initial query count is smaller than a chunk size', () => {
  it('should return 1 selector if query count <= chunkSize', async() => {
    getCountBySelector.mockReturnValueOnce(100);
    const result = await chunkQuery({}, {a: 1}, 100);

    expect(result).toEqual([{a: 1}]);
  });
});

describe('initial query is big, but next returns small chunks', () => {
  const smallIdCountA = {_id: 'a', count: 1};
  const smallIdCountB = {_id: 'b', count: 2};
  const smallIdCountC = {_id: 'c', count: 3};

  it('should call aggregateIdPrefixes when query count > chunkSize', async() => {
    aggregateIdPrefixes.mockReturnValueOnce([smallIdCountA]);
    getCountBySelector.mockReturnValueOnce(9999);
    await chunkQuery({}, {a: 1}, 100);

    expect(aggregateIdPrefixes).toBeCalledWith({}, {a: 1}, 0);
  });

  it('should return array of small chunked queries', async() => {
    aggregateIdPrefixes.mockReturnValueOnce([
      smallIdCountA, smallIdCountB, smallIdCountC
    ]);
    getCountBySelector.mockReturnValueOnce(9999);
    const subQueries = await chunkQuery({}, {a: 1}, 100);

    expect(subQueries).toEqual([
      {a: 1, _id: {$regex: '^a|^b|^c', $options: 'i'}}
    ]);
  });
});

describe('initial query is big, but next returns big chunks', () => {
  const smallIdCountA = {_id: 'a', count: 1};
  const smallIdCountB = {_id: 'zo', count: 2};
  const bigIdCountA = {_id: 'z', count: 4500};

  it('should call aggregateIdPrefixes w/ nested selector', async() => {
    aggregateIdPrefixes
      .mockReturnValueOnce([smallIdCountA, bigIdCountA])
      .mockReturnValueOnce([smallIdCountB]);
    getCountBySelector.mockReturnValueOnce(9999);
    await chunkQuery({}, {a: 1}, 100);

    expect(aggregateIdPrefixes).toBeCalledWith({}, {
      _id: {$options: "i", $regex: "^z"},
      a: 1
    }, 1);
  });

  it('should return two sub queries, initial small and bigger nested', async() => {
    aggregateIdPrefixes
      .mockReturnValueOnce([smallIdCountA, bigIdCountA])
      .mockReturnValueOnce([smallIdCountB]);
    getCountBySelector.mockReturnValueOnce(9999);
    const subQueries = await chunkQuery({}, {a: 1}, 100);

    expect(subQueries).toEqual([
      {a: 1, _id: {$regex: '^a', $options: 'i'}},
      {a: 1, _id: {$regex: '^zo', $options: 'i'}}
    ]);
  });
});

describe('big set of nested queries', () => {
  /*
  ^a - 88
  ^b - 500
    ^ba - 50
    ^bb - 400
      ^bbc - 300
        ^bbca - 100
        ^bbcb - 100
        ^bbcc - 100
      ^bbk - 100
  ^o - 120
    ^ob - 20
    ^oc - 9
  ^z - 1
   */

  it('should return array of nested sub queries', async() => {
    getCountBySelector.mockReturnValueOnce(9999);
    aggregateIdPrefixes
      .mockReturnValueOnce([
        {_id: 'a', count: 88}, // ok
        {_id: 'b', count: 500}, // b ->
        {_id: 'o', count: 120}, // o ->
        {_id: 'z', count: 1} // ok
      ])
      .mockReturnValueOnce([ // <- b
        {_id: 'ba', count: 50}, // ok
        {_id: 'bb', count: 400} // bb ->
      ])
      .mockReturnValueOnce([ // <- bb
        {_id: 'bbc', count: 300}, // bbc ->
        {_id: 'bbk', count: 100} // ok
      ])
      .mockReturnValueOnce([ // <- bbc
        {_id: 'bbca', count: 100}, // ok
        {_id: 'bbcb', count: 100}, // ok
        {_id: 'bbcc', count: 100} // ok
      ])
      .mockReturnValueOnce([ // <- o
        {_id: 'ob', count: 20}, // ok
        {_id: 'oc', count: 9} // ok
      ]);
    const subQueries = await chunkQuery({}, {a: 1}, 100);

    expect(subQueries).toEqual([
      {a: 1, _id: {$regex: '^z|^a', $options: 'i'}},
      {a: 1, _id: {$regex: '^ba', $options: 'i'}},
      {a: 1, _id: {$regex: '^bbca', $options: 'i'}},
      {a: 1, _id: {$regex: '^bbcb', $options: 'i'}},
      {a: 1, _id: {$regex: '^bbcc', $options: 'i'}},
      {a: 1, _id: {$regex: '^bbk', $options: 'i'}},
      {a: 1, _id: {$regex: '^oc|^ob', $options: 'i'}}
    ]);
  });
});
