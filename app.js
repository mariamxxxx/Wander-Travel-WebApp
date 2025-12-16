require('dotenv').config();
const { connectDB } = require('./db');

const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'travelsecret',
  resave: false,
  saveUninitialized: true
}));

// Import routes
const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const categoriesRoutes = require('./routes/categories');

// Use routes
app.use('/', authRoutes);      // Handles /login, /register
app.use('/home', homeRoutes);  // Handles /home
app.use('/', categoriesRoutes);

// IMPORTANT: Root route must be AFTER authRoutes
// but can be simple redirect or render
app.get('/', (req, res) => {
  // If user is logged in, redirect to home
  if (req.session.userId) {
    return res.redirect('/home');
  }
  // Otherwise show login
  res.render('login', { error: null });
});

// Connect to database and start server
async function startServer() {
  try {
    await connectDB();
    console.log('✅ Database connected successfully');
    
    app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();