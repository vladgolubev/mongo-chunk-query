jest.mock('./mongo');

import {getCountBySelector, aggregateIdPrefixes} from './mongo';
import {chunkQuery} from '.';

it('should export chunkQuery function', () => {
  expect(chunkQuery).toBeInstanceOf(Function);
});

it('should return 1 selector if query count <= chunkSize', async() => {
  getCountBySelector.mockReturnValueOnce(100);
  const result = await chunkQuery({}, {a:1}, 100);

  expect(result).toEqual([{a:1}]);
});
