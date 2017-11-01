export function aggregateIdPrefixes(dbCollection, selector, prefixLength) {
  console.log(prefixLength+1,JSON.stringify(selector));
  const pipeline = [
    {
      $match: selector
    },
    {
      $group: {
        _id: {
          $toLower: {
            $substr: ['$_id', 0, prefixLength + 1]
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

export function getCountBySelector(dbCollection, selector) {
  return dbCollection.find(selector).count();
}
