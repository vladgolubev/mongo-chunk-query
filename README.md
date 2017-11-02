# mongo-chunk-query

> Split any query for parallel processing

## Install

```
$ yarn add mongo-chunk-query
```

## Usage

```js
import {MongoClient} from 'mongodb';
import {chunkQuery} from 'mongo-chunk-query';

const db = await MongoClient.connect('...');


// Let's say you have 100 000 users in collection
// You want to parallelize reading of some query

chunkQuery(db.collection('users'), {planet: 'Earth'}, 1000);
```

And now you have array of selectors split by size.
Your original selector + addition to make it smaller.
Since it splits by `_id` - query is fast.

```js
[
  {planet: 'Earth', _id: {$regex: '[b][klmn]', $options: 'i'}}, // 1000 docs
  {planet: 'Earth', _id: {$regex: '[03][f]', $options: 'i'}} // 1000 docs
  // ...
]
```

Now you can distribute reading of the large cursor into small workloads.

## License

MIT © [Vlad Holubiev](https://vladholubiev.com)
