require('dotenv').config();
const express = require('express');
const session = require('cookie-session');
const { connectDB } = require('./models/db');
const { seedDemoUsers } = require('./models/user');
const { authRouter } = require('./routes/auth');
const webRouter = require('./routes/web');
const apiRouter = require('./routes/api');

const app = express();
const port = Number(process.env.PORT) || 8099;
const sessionSecret = process.env.SESSION_SECRET;
const demoPassword = process.env.DEMO_PASSWORD;
const production = process.env.NODE_ENV === 'production';

app.set('view engine', 'ejs');
if (production) app.set('trust proxy', 1);
app.use(express.static('public'));
app.use(session({
  name: 'hk-guide-session',
  keys: [sessionSecret],
  sameSite: 'lax',
  secure: production
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '32kb' }));

app.use('/', authRouter);
app.use('/', webRouter);
app.use('/api', apiRouter);

app.use((req, res, next) => {
  const error = new Error('Page not found.');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  const message = status === 500 ? 'Sorry, something went wrong. Please try again.' : error.message;
  if (req.path.startsWith('/api/')) return res.status(status).json({ error: message });
  res.status(status).render('error', {
    title: 'Error',
    currentUser: req.session && req.session.user,
    message
  });
});

async function start() {
  if (!sessionSecret || sessionSecret.startsWith('replace-')) {
    throw new Error('Set SESSION_SECRET in .env before starting the server.');
  }
  if (!demoPassword || demoPassword.startsWith('replace-')) {
    throw new Error('Set DEMO_PASSWORD in .env before starting the server.');
  }
  await connectDB();
  await seedDemoUsers(demoPassword);
  app.listen(port, '0.0.0.0', () => console.log(`Guide running at http://localhost:${port}`));
}

start().catch((error) => { console.error(error); process.exitCode = 1; });
