const { MongoClient } = require('mongodb');

let db;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'comp3810sef_hk_guide';
  if (!uri) throw new Error('Set MONGODB_URI in .env before starting the server.');

  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  await db.collection('users').createIndex({ username: 1 }, { unique: true });
}

function getCollection(name) {
  if (!db) throw new Error('Database not initialized.');
  return db.collection(name);
}

module.exports = { connectDB, getCollection };
