const express = require('express');
const formidable = require('express-formidable');
const fs = require('fs').promises;
const { requireLogin } = require('./auth');
const {
  STAGES,
  CATEGORIES,
  TYPES,
  fail,
  buildFilter,
  readPostInput,
  readUploadedPhoto,
  postsCollection,
  findPost
} = require('../models/post');

const router = express.Router();
const uploadForm = formidable();

async function requireAuthor(req, res, next) {
  const post = await findPost(req.params.id);
  if (post.authorId !== req.session.user.username) {
    throw fail(403, 'You can only edit or delete your own posts.');
  }
  req.post = post;
  next();
}

async function readPostForm(req) {
  try {
    const post = readPostInput(req.fields);
    const photo = await readUploadedPhoto(req.files.photo);
    return { post, photo };
  } finally {
    for (const file of Object.values(req.files)) {
      await fs.rm(file.path, { force: true });
    }
  }
}

router.get('/', (req, res) => {
  res.render('home', { title: 'New to Hong Kong Guide', currentUser: req.session.user });
});
router.get('/health', (req, res) => res.status(200).json({ ok: true }));

router.get('/posts', requireLogin, async (req, res) => {
  const filter = buildFilter(req.query);
  const posts = await postsCollection().find(filter).sort({ createdAt: -1 }).limit(50).toArray();
  res.render('posts', {
    title: 'Student posts',
    currentUser: req.session.user,
    posts,
    filters: req.query,
    stages: STAGES,
    categories: CATEGORIES,
    types: TYPES
  });
});

router.get('/posts/new', requireLogin, (req, res) => {
  res.render('post-form', {
    title: 'New post',
    currentUser: req.session.user,
    post: {},
    stages: STAGES,
    categories: CATEGORIES,
    types: TYPES,
    action: '/posts',
    submitLabel: 'Publish post'
  });
});

router.post('/posts', requireLogin, uploadForm, async (req, res) => {
  const { post, photo } = await readPostForm(req);
  if (photo) {
    post.photo = photo.photo;
    post.photoType = photo.photoType;
  }
  const now = new Date();
  post.authorId = req.session.user.username;
  post.authorName = req.session.user.displayName;
  post.createdAt = now;
  post.updatedAt = now;
  const result = await postsCollection().insertOne(post);
  res.redirect(`/posts/${result.insertedId}`);
});

router.get('/posts/:id', requireLogin, async (req, res) => {
  const post = await findPost(req.params.id);
  res.render('post-detail', {
    title: post.title,
    currentUser: req.session.user,
    post,
    stages: STAGES,
    categories: CATEGORIES,
    types: TYPES
  });
});

router.get('/posts/:id/edit', requireLogin, requireAuthor, (req, res) => {
  res.render('post-form', {
    title: 'Edit post',
    currentUser: req.session.user,
    post: req.post,
    stages: STAGES,
    categories: CATEGORIES,
    types: TYPES,
    action: `/posts/${req.post._id}/edit`,
    submitLabel: 'Save changes'
  });
});

router.post('/posts/:id/edit', requireLogin, requireAuthor, uploadForm, async (req, res) => {
  const { post, photo } = await readPostForm(req);
  post.updatedAt = new Date();
  const updateQuery = { $set: post };
  if (photo) {
    post.photo = photo.photo;
    post.photoType = photo.photoType;
  } else if (req.fields.removePhoto === '1') {
    updateQuery.$unset = { photo: '', photoType: '' };
  }

  await postsCollection().updateOne({ _id: req.post._id }, updateQuery);
  res.redirect(`/posts/${req.post._id}`);
});

router.post('/posts/:id/delete', requireLogin, requireAuthor, async (req, res) => {
  await postsCollection().deleteOne({ _id: req.post._id });
  res.redirect('/posts');
});

module.exports = router;
