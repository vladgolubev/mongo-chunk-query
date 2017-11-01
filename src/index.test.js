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
  const bigIdCountA = {_id: 'z', count: 4500};

  it('should call aggregateIdPrefixes when query count > chunkSize', async() => {
    aggregateIdPrefixes.mockReturnValueOnce([smallIdCountA]);
    getCountBySelector.mockReturnValueOnce(9999);
    await chunkQuery({}, {a: 1}, 100);

    expect(aggregateIdPrefixes).toBeCalledWith({}, {a: 1}, 1);
  });

  it('should return array of small chunked queries', async() => {
    aggregateIdPrefixes.mockReturnValueOnce([
      smallIdCountA, smallIdCountB, smallIdCountC
    ]);
    getCountBySelector.mockReturnValueOnce(9999);
    const subQueries = await chunkQuery({}, {a: 1}, 100);

    expect(subQueries).toEqual([
      {a: 1, _id: {$regex: '^a', $options: 'i'}},
      {a: 1, _id: {$regex: '^b', $options: 'i'}},
      {a: 1, _id: {$regex: '^c', $options: 'i'}}
    ]);
  });

});
