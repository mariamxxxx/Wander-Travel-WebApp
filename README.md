# Wander Travel WebApp

## Overview
- Server-rendered travel inspiration app built with Node.js, Express 5, EJS templates, and vanilla CSS/JS.
- Provides destination pages (cities, islands, hiking routes, etc.) plus login/registration flows backed by MongoDB.
- Session-based auth keeps users logged in after successful registration/login.

## Tech Stack
- Node.js (CommonJS) + Express 5
- EJS view engine with static assets in `public/`
- MongoDB via the official `mongodb` driver
- `express-session` for session management
- `bcrypt` ready for password hashing (add hashing in `routes/auth.js` if not already applied)

## Prerequisites
- Node.js 18+ and npm (bundled with Node)
- Git (for cloning) or download the ZIP from GitHub
- MongoDB instance: local `mongod` service or a hosted MongoDB Atlas cluster
- A `.env` file with your secrets (see below)


## Getting Started From Scratch
1. **Clone or download the project**
	```powershell
	git clone https://github.com/mariamxxxx/Wander-Travel-WebApp.git
	cd Wander-Travel-WebApp
	```

2. **Install dependencies**
	```powershell
	npm install
	```

3. **Create the `.env` file** at the project root:
	```text
	PORT=3000               # Optional. Defaults to 3000.
	DB_URL=mongodb://127.0.0.1:27017
	SESSION_SECRET=replace-with-long-random-string
	```
	- `DB_URL` can also point to an Atlas URI such as `mongodb+srv://USER:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority`.
	- The app automatically connects to the `travelDB` database inside the Mongo instance configured here.


4. **Prepare MongoDB**
	- Start your MongoDB server (`mongod`) if running locally, or ensure your Atlas cluster is reachable.
	- Create the `travelDB` database and a `users` collection. You can insert a starter account via `mongosh`:
	  ```javascript
	  use travelDB;
	  db.users.insertOne({ username: "demo", password: "plaintext-or-bcrypt-hash" });
	  ```
	  Replace the password with a bcrypt hash if you have updated the auth route to hash passwords.


5. **Start the application**
	- Development mode with auto-reload:
	  ```powershell
	  npm run dev
	  ```
	- Production/one-off run:
	  ```powershell
	  npm start
	  ```
	- Once running, visit http://localhost:3000 (or whatever `PORT` you set).


## Available Scripts
- `npm start` – Runs `node app.js` for production-style execution.
- `npm run dev` – Runs the server through `nodemon` for auto-restarts on file changes.


## Project Structure
```
app.js                # Express app + session + MongoDB bootstrap
db.js                 # MongoDB connection helper
models/               # DB helper modules
routes/               # Express route handlers (auth, home, categories)
views/                # EJS templates for each destination page
public/               # Static assets (CSS, client-side JS, images)
```


## Environment Tips
- Keep `.env` out of version control (`.gitignore` already handles this).
- Use distinct `SESSION_SECRET` values per environment (dev/prod).
- For Atlas deployments, ensure your IP is whitelisted and DNS SRV support is enabled.


## Troubleshooting
- **`MongoDB connection error`**: Verify `DB_URL`, that Mongo is running, and that the `travelDB` database exists.
- **`Cannot GET /home` after login**: Ensure registration/login routes insert users into `travelDB.users` and sessions are persisting (`SESSION_SECRET` set, cookies enabled).
- **Port already in use**: Change `PORT` in `.env` or terminate the other process using that port.

You now have everything needed to spin up the Wander Travel WebApp from a clean machine. Happy exploring!

