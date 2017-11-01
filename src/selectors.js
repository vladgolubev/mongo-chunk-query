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
  if (selectors.length === 0) {
    return [];
  }

  if (selectors.length === 1) {
    return selectors;
  }

  const selectorsSorted = _.orderBy(selectors, ['count'], ['asc']);
  const results = [];

  for (let selector of selectorsSorted) {
    const prevSelector = _.last(results);

    if (prevSelector) {
      const isPrevSelectorFits = prevSelector.count + selector.count <= chunkSize;

      if (isPrevSelectorFits) {
        selector._id.split('').forEach((char, i) => {
          if (_.isUndefined(prevSelector.idBuffer)) {
            prevSelector.idBuffer = [];
          }

          if (_.isUndefined(prevSelector.idBuffer[i])) {
            prevSelector.idBuffer[i] = [];
          }

          prevSelector.idBuffer[i].push(char);
        });

        prevSelector.count += selector.count;
      } else {
        results.push(selector);
      }
    } else {
      selector.idBuffer = selector._id.split('').map(char => [char]);
      results.push(selector);
    }
  }

  return results.map(selector => {
    if (!_.isUndefined(selector.idBuffer)) {
      selector._id = selector.idBuffer.map(firstCharArray => `[${_.join(_.uniq(firstCharArray).sort(), '')}]`).join('');
      delete selector.idBuffer;
    }

    return selector;
  });
}
