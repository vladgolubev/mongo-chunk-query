import {getCountBySelector, aggregateIdPrefixes} from './mongo';

export async function chunkQuery(dbCollection, selector, chunkSize) {
  const countBySelector = await getCountBySelector(selector);

  if (countBySelector <= chunkSize) {
    return [selector];
  }

  return chunkChildQuery(dbCollection, selector, chunkSize, '', 1);
}

async function chunkChildQuery(dbCollection, selector, chunkSize, idPrefix, idLength) {
  const selectorWithIdPrefix = getSelectorWithIdPrefix(selector, idPrefix);
  const idCounts = await aggregateIdPrefixes(dbCollection, selectorWithIdPrefix, idLength);
  const idCountsBelowChunkSize = idCounts.filter(({count}) => count <= chunkSize);
  const idCountsAboveChunkSize = idCounts.filter(({count}) => count > chunkSize);
  const resultChunks = [];

  idCountsBelowChunkSize.forEach(({_id}) => {
    resultChunks.push(getSelectorWithIdPrefix(selector, _id));
  });

  return resultChunks;
}

function getSelectorWithIdPrefix(selector, idPrefix) {
  if (!idPrefix) {
    return selector;
  }

  return {
    ...selector,
    _id: {$regex: `^${idPrefix}`, $options: 'i'}
  }
}
