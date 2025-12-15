// // const mongoose = require('mongoose');

// // const userSchema = new mongoose.Schema({
// //     username: {type: String, required: true, unique: true},
// //     password:{type:String, required:true}
// // })

// // module.exports = mongoose.model('User', userSchema);
// //your User model is ready to use in the rest of your app

// // routes/auth.js
// const express = require('express');
// const router = express.Router();
// const { db } = require('../app'); // use db exported from app.js

// // Signup
// router.post('/register', async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     // Check if username already exists
//     const existingUser = await db.collection('users').findOne({ username });
//     if (existingUser) return res.send('Username already exists');

//     // Insert user
//     await db.collection('users').insertOne({ username, password });
//     res.send('User created successfully!');
//   } catch (err) {
//     res.send('Error: ' + err.message);
//   }
// });

// // Login
// // router.post('/login', async (req, res) => {
// //   const { username, password } = req.body;

// //   const user = await db.collection('users').findOne({ username, password });
// //   if (!user) return res.send('Invalid username or password');

// //   res.send('Login successful!');
// // });

// module.exports = router;
// models/User.js
// Nothing special — just an object template

// models/User.js
let db;

function initDatabase(client) {
  db = client.db("travelDB");
}

async function findUser(username) {
  return await db.collection("users").findOne({ username });
}

async function createUser(username, password) {
  return await db.collection("users").insertOne({ username, password });
}

module.exports = { initDatabase, findUser, createUser };
