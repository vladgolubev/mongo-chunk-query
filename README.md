# mongo-chunk-query

> Split any query for parallel processing

## Install

```
$ yarn add mongo-chunk-query
```

## Usage

Let's say you have 100 000 users in collection.
You want to read all of them efficiently.

```js
import {MongoClient} from 'mongodb';
import {chunkQuery} from 'mongo-chunk-query';

const db = await MongoClient.connect('...');

const queryChunks = await chunkQuery(
  db.collection('users'), // mongodb collection object
  {planet: 'Earth'}, // optional selector for more specific query
  1000 // chunk size - will split original query into subqueries
);
```

Now you have array of selectors split into chunks.

```js
[
  {planet: 'Earth', _id: {$regex: '[b][klmn]', $options: 'i'}}, // 1000 docs
  {planet: 'Earth', _id: {$regex: '[03][f]', $options: 'i'}} // 1000 docs
  // ...
]
```

So now it's possible to distribute these queries between different workers.

## License

MIT © [Vlad Holubiev](https://vladholubiev.com)
