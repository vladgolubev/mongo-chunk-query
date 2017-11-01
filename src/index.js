import {getCountBySelector, aggregateIdPrefixes} from './mongo';

export async function chunkQuery(dbCollection, selector, chunkSize) {
  const countBySelector = await getCountBySelector(selector);

  if (countBySelector <= chunkSize) {
    return [selector];
  }
}
