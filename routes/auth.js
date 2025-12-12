
const express = require('express');
const router = express.Router();
const { getDB } = require('../db'); // Use native MongoDB via getDB()

// Signup route (display form)
router.get('/registration', (req, res) => {
  res.render('registration'); // Create signup.ejs in views folder
});


// -----------------
// REGISTER ROUTE
// -----------------
router.get('/register', (req, res) => {
  res.render('registration'); // renders registration.ejs
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Optional: check if user exists
    const usersCollection = getDB().collection('users');
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.send('User already exists');
    }

    // Save user to DB
    await usersCollection.insertOne({ username, password });

    // Redirect user to login page after successful registration
    return res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// -----------------
// LOGIN ROUTE
// -----------------
router.get('/login', (req, res) => {
  res.render('login'); // renders login.ejs
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    //const user = await User.findOne({ username });
    const usersCollection = getDB().collection('users');
    const user = await usersCollection.findOne({ username });
    if (!user) {
      return res.send('User not found');
    }

    // For now, no password hashing:
    if (user.password !== password) {
      return res.send('Incorrect password');
    }

    // Set session
    req.session.userId = user._id;
    //res.send('Login successful!');
    return res.redirect('/home');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;


// Handle signup form submission
// router.post('/registration', async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const user = new User({ username, password });
//     await user.save();
//     res.send('User created successfully!');
//   } catch (err) {
//     res.send('Error: ' + err.message);
//   }
// });

// Login route (display form)
// router.get('/login', (req, res) => {
//   res.render('login'); // Create login.ejs
// });

// // Handle login form submission
// router.post('/login', async (req, res) => {
//   const { username, password } = req.body;

//   const user = await User.findOne({ username, password });
//   if (!user) return res.send('Invalid username or password');

//   res.send('Login successful!');
// });

module.exports = router;
