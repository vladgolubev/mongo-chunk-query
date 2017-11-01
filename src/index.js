import {aggregateIdPrefixes, getCountBySelector} from './mongo';
import {getSelectorWithIdPrefix, collapseSelectorsUpToChunkSize} from './selectors';

export async function chunkQuery(dbCollection, selector, chunkSize) {
  const countBySelector = await getCountBySelector(dbCollection, selector);

  if (countBySelector <= chunkSize) {
    return [selector];
  }

  return chunkChildQuery(dbCollection, selector, chunkSize, '');
}

async function chunkChildQuery(dbCollection, selector, chunkSize, idPrefix) {
  const selectorWithIdPrefix = getSelectorWithIdPrefix(selector, idPrefix);
  const idCounts = await aggregateIdPrefixes(dbCollection, selectorWithIdPrefix, idPrefix.length);
  const idCountsBelowChunkSize = idCounts.filter(({count}) => count <= chunkSize);
  const idCountsAboveChunkSize = idCounts.filter(({count}) => count > chunkSize);
  const idCountsBelowChunkSizeCollapsed = collapseSelectorsUpToChunkSize(idCountsBelowChunkSize, chunkSize);
  const resultChunks = [];

  idCountsBelowChunkSizeCollapsed.forEach(({_id}) => {
    resultChunks.push(getSelectorWithIdPrefix(selector, _id));
  });

  await Promise.all(idCountsAboveChunkSize.map(async({_id}) => {
    const recursiveResult = await chunkChildQuery(dbCollection, selector, chunkSize, _id);
    resultChunks.push(...recursiveResult);
  }));

  return resultChunks;
}
