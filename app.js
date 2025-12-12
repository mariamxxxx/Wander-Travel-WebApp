require('dotenv').config(); //allows rendering dynamic html pages
const { getDB } = require('./db'); // path to your db.js

//Importing express library
const express = require('express');
const session = require('express-session');
const path = require('path');

//our application as an object
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true })); // to read form data
//“Whenever a request comes in, if it has JSON data in its body, automatically convert it into a JavaScript object so I can use it in my code.”
app.use(express.json());
//Serve static files from "public" folder
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'travelsecret',
  resave: false,
  saveUninitialized: true
}));
//used for login, logout systems

const authRoutes = require('./routes/auth');
// const placeRoutes = require('./routes/places');
// const todoRoutes = require('./routes/todo');

app.use('/', authRoutes);
// app.use('/places', placeRoutes);
// app.use('/todo', todoRoutes);

// Route for reg page
app.get('/', (req, res) => {
res.render('login'); 
});

// Registration page
app.get('/register', (req, res) => {
    res.render('registration'); // your registration.ejs
});


// app.get('/test-db', async (req, res) => {
//   try {
//     const db = client.db("travelDB"); // or your actual DB name
//     const collections = await db.listCollections().toArray();

//     res.send({
//       message: "Connected to MongoDB!",
//       collections: collections
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Database error");
//   }
// });

app.listen(port, () => {
  console.log(`Website running at http://localhost:${port}`);
});



