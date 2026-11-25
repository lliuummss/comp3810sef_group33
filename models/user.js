const crypto = require('node:crypto');
const { getCollection } = require('./db');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, key] = stored.split(':');
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  if (derived.length !== keyBuffer.length) return false;
  return crypto.timingSafeEqual(derived, keyBuffer);
}

async function findByUsername(username) {
  return getCollection('users').findOne({ username });
}

async function createUser({ username, displayName, password }) {
  const users = getCollection('users');
  const doc = {
    username,
    displayName,
    passwordHash: hashPassword(password),
    createdAt: new Date()
  };
  await users.insertOne(doc);
  return doc;
}

async function seedDemoUsers(demoPassword) {
  const users = getCollection('users');
  const demos = [
    { username: 'student1', displayName: 'Student One' },
    { username: 'student2', displayName: 'Student Two' }
  ];
  for (const demo of demos) {
    const existing = await users.findOne({ username: demo.username });
    if (!existing) {
      await createUser({
        username: demo.username,
        displayName: demo.displayName,
        password: demoPassword
      });
    }
  }
}

module.exports = {
  verifyPassword,
  findByUsername,
  createUser,
  seedDemoUsers
};
