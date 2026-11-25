# COMP3810SEF Group 33 – New to Hong Kong Guide

## 1. Project info

**Project name:** New to Hong Kong Guide

New to Hong Kong Guide is a server-side web app for students who have just arrived in Hong Kong. Logged-in students can post tips, warnings (cautions), and questions about transport, housing, campus, and daily life. Each post is tagged with a stage (before arrival, first week, or settling in), a category, and a type. Students can search posts by keyword and by these tags. They can also add a photo to a post. Only the author of a post can edit or delete it on the website.

The app is built with Express.js, EJS, and the MongoDB Node.js driver. Login uses `cookie-session`. The app also has RESTful CRUD APIs for posts.

## 2. Group info

**Group no.:** 33

| Name | SID | Work role |
| --- | --- | --- |
| LI Zhuoyuan | 13760211 | Server setup and integration |
| LANG Jingfei | 13733731 | Database design and data models |
| YU Guangze | 13780627 | Login, registration, and logout |
| CHEN Yuyong | 14284943 | CRUD web pages |
| Law Yiu To | 13899626 | UI design |
| WANG Zexin | 13804992 | RESTful API and testing |

## 3. Project file intro

```
comp3810sef_group33
├── server.js
├── package.json
├── package-lock.json
├── .env.example
├── public/
│   └── css/style.css
├── views/
│   ├── partials/header.ejs
│   ├── partials/footer.ejs
│   ├── home.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── posts.ejs
│   ├── post-detail.ejs
│   ├── post-form.ejs
│   └── error.ejs
├── models/
│   ├── db.js
│   ├── user.js
│   └── post.js
├── routes/
│   ├── auth.js
│   ├── web.js
│   └── api.js
└── README.md
```

### server.js

- Loads settings from `.env` using `dotenv`.
- Creates the Express app, sets EJS as the view engine, and serves static files from `public/`.
- Sets up `cookie-session` for login sessions and parses form data and JSON request bodies.
- Mounts the routers: `routes/auth.js` and `routes/web.js` at `/`, and `routes/api.js` at `/api`.
- Handles 404 and other errors. Web pages show `error.ejs` and API requests get a JSON error.
- Connects to MongoDB, creates the demo users if they are missing, and starts the server on `PORT` (default 8099).

### package.json

Start script: `npm start` (runs `node server.js`).

| Dependency | Use |
| --- | --- |
| `express` | Web framework |
| `mongodb` | MongoDB Node.js driver |
| `ejs` | Page templates |
| `cookie-session` | Stores the login session in a cookie |
| `express-formidable` | Reads the create/edit post forms, including photo uploads |
| `dotenv` | Loads settings from `.env` |

`package-lock.json` locks the exact package versions so that `npm ci` installs the same versions.

`.env.example` is an example settings file. It sets `MONGODB_URI`, `DB_NAME`, `SESSION_SECRET`, `DEMO_PASSWORD`, and `PORT`.

### public

- `css/style.css`: styles for all pages (header, forms, post cards, search bar, buttons, and error page).

### views

| File | Content |
| --- | --- |
| `partials/header.ejs` | Shared page head and top menu. Logged-in users see **Posts**, **New post**, their display name, and **Log out**. Other visitors see **Log in** and **Register**. |
| `partials/footer.ejs` | Shared footer |
| `home.ejs` | Home page that introduces the site. Anyone can open it. |
| `login.ejs` | Login form |
| `register.ejs` | Form for creating a new account |
| `posts.ejs` | Post list with the search form (keyword, stage, category, type) |
| `post-detail.ejs` | One post with its photo. The author also sees **Edit post** and **Delete post**. |
| `post-form.ejs` | Form used both for creating and for editing a post, including photo upload and photo removal |
| `error.ejs` | Error page, for example for "Post not found" or invalid input |

### models

| File | Content |
| --- | --- |
| `db.js` | Connects to MongoDB, adds a unique index on `username`, and gives other files access to collections |
| `user.js` | Creates users, hashes and checks passwords (Node.js `crypto` scrypt with a salt), finds users by username, and creates the demo users |
| `post.js` | Lists of stages, categories, and types; checks post input; builds search filters; checks photo uploads; finds a post by id |

Database collections:

- `users`: `username`, `displayName`, `passwordHash`, `createdAt`
- `posts`: `title`, `body`, `stage`, `category`, `type`, `photo` (base64, optional), `photoType`, `authorId`, `authorName`, `createdAt`, `updatedAt`

### routes

| File | Content |
| --- | --- |
| `auth.js` | `GET/POST /login`, `GET/POST /register`, `POST /logout`, and the `requireLogin` middleware |
| `web.js` | Home page and the CRUD web pages for posts (login required) |
| `api.js` | RESTful CRUD APIs for posts (no login required) |

## 4. Operation guides

### Start the server

1. Install Node.js 18 or newer, and start MongoDB locally or use MongoDB Atlas.
2. Copy `.env.example` to `.env`. Set `MONGODB_URI` to your MongoDB address. **Change `SESSION_SECRET` to any value that does not start with `replace-`**, otherwise the server will not start.
3. In the project folder, run `npm ci` and then `npm start`.
4. Open `http://localhost:8099`.

### Use of Login/Logout pages

Valid login information (created automatically when the server starts):

| Username | Password |
| --- | --- |
| `student1` | `guide-demo-2026` |
| `student2` | `guide-demo-2026` |

The password is the `DEMO_PASSWORD` value in `.env` at the time the accounts were first created. The example file uses `guide-demo-2026`.

- **Log in:** click **Log in** in the top menu, enter a username and password, and click **Log in**. You are taken to the **Posts** page.
- **Register:** click **Register** in the top menu, enter a username (3–24 letters, numbers, `_` or `-`), a display name, and a password (at least 6 characters), then click **Create account**. You are logged in and taken to **Posts**.
- **Log out:** click **Log out** in the top menu on any page. You are taken back to the login page.

If you open a CRUD page such as `/posts` without logging in, you are redirected to `/login`.

### Use of CRUD web pages

| Function | How to use |
| --- | --- |
| **Create** | Click **New post** in the top menu (or **+ New post** on the Posts page). Enter a title and content, choose a stage, category, and type, and optionally add a photo (JPG/PNG/WebP/GIF, up to 2 MB). Click **Publish post**. |
| **Read / search** | Click **Posts** in the top menu. Type a keyword (searches title and content) and/or choose **Stage**, **Category**, and **Type**, then click **Search**. Conditions can be combined, for example First week + Transport + keyword "bus". Click **Clear** to show all posts. Click a post title to read the full post. |
| **Update** | Open a post you wrote and click **Edit post**. Change any fields, upload a new photo, or tick **Remove current photo**. Click **Save changes**. |
| **Delete** | Open a post you wrote, click **Delete post**, and click **OK** in the confirmation box. You are taken back to **Posts**. |

Only the author of a post sees the **Edit post** and **Delete post** buttons. Other users get a 403 error if they try to edit or delete it.

### Use of RESTful CRUD services

The APIs do not need login. Request and response bodies are JSON.

| HTTP method | Path URI | Function |
| --- | --- | --- |
| GET | `/api/posts` | Read posts. Optional query conditions: `q` (keyword), `stage`, `category`, `type` |
| GET | `/api/posts/:id` | Read one post by id |
| POST | `/api/posts` | Create a post |
| PUT | `/api/posts/:id` | Update a post |
| DELETE | `/api/posts/:id` | Delete a post |

POST and PUT need all five fields: `title` (3–100 characters), `body` (10–5000 characters), `stage`, `category`, and `type`.

- `stage`: `before-arrival`, `first-week`, `settling-in`
- `category`: `transport`, `housing`, `campus`, `daily`
- `type`: `tip`, `caution`, `question`

Status codes: `200` OK, `201` created, `400` invalid input, `404` post not found.

CURL testing commands. Run them in order in the same terminal window. The Create command saves the new post's id in `POST_ID`, so the Read, Update, and Delete commands can be copied and run without editing.

Create:

```sh
POST_ID=$(curl -s -X POST http://localhost:8099/api/posts -H "Content-Type: application/json" -d '{"title":"Octopus card tip","body":"Buy an Octopus card at the airport MTR station.","stage":"first-week","category":"transport","type":"tip"}' | sed -E 's/.*"id":"([0-9a-f]{24})".*/\1/'); echo "POST_ID=$POST_ID"
```

Read (all posts, posts matching query conditions, and the new post):

```sh
curl http://localhost:8099/api/posts; echo
curl "http://localhost:8099/api/posts?stage=first-week&category=transport&q=octopus"; echo
curl http://localhost:8099/api/posts/$POST_ID; echo
```

Update:

```sh
curl -X PUT http://localhost:8099/api/posts/$POST_ID -H "Content-Type: application/json" -d '{"title":"Octopus card tip (updated)","body":"You can also add an Octopus card to your phone.","stage":"first-week","category":"transport","type":"caution"}'; echo
curl http://localhost:8099/api/posts/$POST_ID; echo
```

Delete:

```sh
curl -X DELETE http://localhost:8099/api/posts/$POST_ID; echo
curl http://localhost:8099/api/posts/$POST_ID; echo
```

The last command returns `{"error":"Post not found."}`, which shows that the post was deleted.
