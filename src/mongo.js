export function aggregateIdPrefixes(dbCollection, selector, prefixLength) {
  const pipeline = [
    {
      $match: selector
    },
    {
      $group: {
        _id: {
          $toLower: {
            $substr: ['$_id', 0, prefixLength]
          }
        },
        count: {
          $sum: 1
        }
      }
    }
  ];
  const options = {allowDiskUse: true};

  return dbCollection.aggregate(pipeline, options).toArray();
}
