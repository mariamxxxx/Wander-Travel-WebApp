const express = require('express');
const router = express.Router();
const { getDB } = require('../db'); // Use native MongoDB via getDB()

// Signup route (display form)
router.get('/registration', (req, res) => {
  res.render('registration');
});

// -----------------
// REGISTER ROUTE
// -----------------
router.get('/register', (req, res) => {
  res.render('registration');
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  console.log("Registration attempt - Username:", username, "Password:", password); // DEBUG

  try {
    const usersCollection = getDB().collection('users');

    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      console.log("Username already exists:", username); // DEBUG
      return res.send('User already exists');
    }

    // Save user to DB
    await usersCollection.insertOne({ username, password });
    console.log("User saved to database:", username); // DEBUG

    return res.redirect('/login'); // Go to login page after registration
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).send('Server error');
  }
});

// -----------------
// LOGIN ROUTE - DEBUG VERSION
// -----------------
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log("Login attempt for username:", username); // DEBUG
  console.log("Password provided:", password); // DEBUG

  try {
    const usersCollection = getDB().collection('users');
    console.log("Database connected, searching for user..."); // DEBUG
    
    const user = await usersCollection.findOne({ username });
    console.log("User found in DB:", user); // DEBUG

    if (!user) {
      console.log("User not found in database"); // DEBUG
      return res.send('User not found');
    }

    console.log("DB Password:", user.password, "Input Password:", password); // DEBUG
    if (user.password !== password) {
      console.log("Password mismatch"); // DEBUG
      return res.send('Incorrect password');
    }

    // Set session
    req.session.userId = user._id;
    req.session.username = user.username;

    console.log("Session set - userId:", req.session.userId); // DEBUG

    return res.redirect('/home');
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send('Server error');
  }
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
