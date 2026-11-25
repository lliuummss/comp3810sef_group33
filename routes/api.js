const express = require('express');
const {
  fail,
  objectId,
  buildFilter,
  readPostInput,
  postsCollection,
  findPost
} = require('../models/post');

const router = express.Router();

router.get('/posts', async (req, res) => {
  const filter = buildFilter(req.query);
  const results = await postsCollection()
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  res.json({ count: results.length, posts: results });
});

router.get('/posts/:id', async (req, res) => {
  const post = await findPost(req.params.id);
  res.json(post);
});

router.post('/posts', async (req, res) => {
  const newDoc = readPostInput(req.body || {});
  const now = new Date();
  newDoc.authorId = 'api-demo';
  newDoc.authorName = 'API Demo';
  newDoc.createdAt = now;
  newDoc.updatedAt = now;
  const result = await postsCollection().insertOne(newDoc);
  res.status(201).json({ id: result.insertedId, post: newDoc });
});

router.put('/posts/:id', async (req, res) => {
  const updateDoc = readPostInput(req.body || {});
  updateDoc.updatedAt = new Date();
  const result = await postsCollection().updateOne(
    { _id: objectId(req.params.id) },
    { $set: updateDoc }
  );
  if (!result.matchedCount) throw fail(404, 'Post not found.');
  res.json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
});

router.delete('/posts/:id', async (req, res) => {
  const result = await postsCollection().deleteOne({ _id: objectId(req.params.id) });
  if (!result.deletedCount) throw fail(404, 'Post not found.');
  res.json({ deletedCount: result.deletedCount });
});

module.exports = router;
