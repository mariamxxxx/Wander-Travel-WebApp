const express = require('express');
const bcrypt = require('bcrypt');
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

  console.log("Registration attempt - Username:", username); // DEBUG (omit password)

  try {
    const myCollection = getDB().collection('myCollection');

    const existingUser = await myCollection.findOne({ type: "user", username });
    if (existingUser) {
      console.log("Username already exists:", username); // DEBUG
      return res.send('User already exists');
    }

    // Hash password then save user to DB with empty want-to-go list
    const hashedPassword = await bcrypt.hash(password, 10);

    await myCollection.insertOne({ 
      type: "user",
      username, 
      password: hashedPassword, 
      wantToGo: []
    });
    console.log("User saved to database:", username); // DEBUG

    return res.redirect('/login?success=Registration successful! Please log in.'); // Go to login page after registration
  } catch (err) {
    console.error("Registration error:", err.message);
    console.error("Full error:", err);
    res.status(500).send('Server error: ' + err.message);
  }
});

// -----------------
// LOGIN ROUTE - DEBUG VERSION
// -----------------
router.get('/login', (req, res) => {
  res.render('login', { successMessage: req.query.success });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log("Login attempt for username:", username); // DEBUG

  try {
    const myCollection = getDB().collection('myCollection');
    console.log("Database connected, searching for user..."); // DEBUG
    
    const user = await myCollection.findOne({ type: "user", username });
    console.log("User found in DB:", user); // DEBUG

    if (!user) {
      console.log("User not found in database"); // DEBUG
      return res.send('User not found');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
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
