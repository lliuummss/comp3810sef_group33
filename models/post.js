const fs = require('fs').promises;
const { ObjectId } = require('mongodb');
const { getCollection } = require('./db');

const STAGES = {
  'before-arrival': 'Before arrival',
  'first-week': 'First week',
  'settling-in': 'Settling in'
};

const CATEGORIES = {
  transport: 'Transport',
  housing: 'Housing',
  campus: 'Campus',
  daily: 'Daily life'
};

const TYPES = {
  tip: 'Tip',
  caution: 'Caution',
  question: 'Question'
};

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function objectId(raw) {
  try {
    return ObjectId.createFromHexString(raw);
  } catch {
    throw fail(404, 'Post not found.');
  }
}

function escapeRegex(value) {
  const specials = '\\.*+?^{}()|[]$';
  let escaped = '';
  for (const character of value) {
    if (specials.includes(character)) escaped += '\\';
    escaped += character;
  }
  return escaped;
}

function buildFilter(query) {
  const filter = {};
  if (query.stage) {
    if (!Object.keys(STAGES).includes(query.stage)) throw fail(400, 'Choose a stage from the list.');
    filter.stage = query.stage;
  }
  if (query.category) {
    if (!Object.keys(CATEGORIES).includes(query.category)) throw fail(400, 'Choose a category from the list.');
    filter.category = query.category;
  }
  if (query.type) {
    if (!Object.keys(TYPES).includes(query.type)) throw fail(400, 'Choose a post type from the list.');
    filter.type = query.type;
  }
  if (query.q) {
    const q = String(query.q).trim();
    if (q.length > 80) throw fail(400, 'The keyword must be 80 characters or fewer.');
    const pattern = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: pattern }, { body: pattern }];
  }
  return filter;
}

function readPostInput(input) {
  const post = {
    title: String(input.title || '').trim(),
    body: String(input.body || '').trim(),
    stage: String(input.stage || ''),
    category: String(input.category || ''),
    type: String(input.type || '')
  };
  if (post.title.length < 3 || post.title.length > 100) throw fail(400, 'Use 3 to 100 characters for the title.');
  if (post.body.length < 10 || post.body.length > 5000) throw fail(400, 'Use 10 to 5,000 characters for the post.');
  if (!Object.keys(STAGES).includes(post.stage)) throw fail(400, 'Choose a stage from the list.');
  if (!Object.keys(CATEGORIES).includes(post.category)) throw fail(400, 'Choose a category from the list.');
  if (!Object.keys(TYPES).includes(post.type)) throw fail(400, 'Choose a post type from the list.');
  return post;
}

async function readUploadedPhoto(file) {
  if (!file || !file.size) return null;
  if (file.size > MAX_PHOTO_BYTES) {
    throw fail(400, 'Photo must be 2 MB or smaller.');
  }
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    throw fail(400, 'Upload a JPG, PNG, WebP, or GIF image.');
  }
  const photo = await fs.readFile(file.path, { encoding: 'base64' });
  return {
    photo,
    photoType: file.type || 'image/jpeg'
  };
}

function postsCollection() {
  return getCollection('posts');
}

async function findPost(id) {
  const post = await postsCollection().findOne({ _id: objectId(id) });
  if (!post) throw fail(404, 'Post not found.');
  return post;
}

module.exports = {
  STAGES,
  CATEGORIES,
  TYPES,
  fail,
  objectId,
  buildFilter,
  readPostInput,
  readUploadedPhoto,
  postsCollection,
  findPost
};
