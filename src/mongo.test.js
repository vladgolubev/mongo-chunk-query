import {aggregateIdPrefixes, getCountBySelector} from './mongo';

const toArrayMock = jest.fn();
const aggregateMock = jest.fn(() => ({
  toArray: toArrayMock
}));
const dbCollection = {aggregate: aggregateMock};

describe('#aggregateIdPrefixes', () => {
  it('should export aggregateIdPrefixes function', () => {
    expect(aggregateIdPrefixes).toBeInstanceOf(Function);
  });

  it('should use proper aggregation pipeline', async() => {
    await aggregateIdPrefixes(dbCollection, {a: 1}, 3);

    expect(aggregateMock).toBeCalledWith([
      {$match: {a: 1}},
      {
        $group: {
          _id: {$toLower: {$substr: ["$_id", 0, 3]}},
          count: {$sum: 1}
        }
      }
    ], {allowDiskUse: true});
  });

  it('should return result of aggregation', async() => {
    toArrayMock.mockReturnValueOnce([1, 2, 3]);
    const idPrefixes = await aggregateIdPrefixes(dbCollection, {a: 1}, 3);

    expect(idPrefixes).toEqual([1, 2, 3]);
  });
});

describe('#getCountBySelector', () => {
  it('should export getCountBySelector function', () => {
    expect(getCountBySelector).toBeInstanceOf(Function);
  });
});
