import _ from 'lodash';

export function getSelectorWithIdPrefix(selector, idPrefix) {
  if (!idPrefix) {
    return selector;
  }

  return {
    ...selector,
    _id: {$regex: `^${idPrefix}`, $options: 'i'}
  };
}

export function collapseSelectorsUpToChunkSize(selectors, chunkSize) {
  if (selectors.length === 1) {
    return selectors;
  }

  const selectorsSorted = _.orderBy(selectors, ['count'], ['asc']);
  const results = [selectorsSorted[0]];

  for (let selector of _.drop(selectorsSorted)) {
    const prevSelector = _.last(results);
    const isPrevSelectorFits = prevSelector.count + selector.count <= chunkSize;

    if (isPrevSelectorFits) {
      prevSelector._id += `|^${selector._id}`;
      prevSelector.count += selector.count;
    } else {
      results.push(selector);
    }
  }

  return results;
}
