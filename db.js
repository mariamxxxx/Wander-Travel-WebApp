const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.DB_URL);
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('travelDB');
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err);
    }
}

// call it once on server start
connectDB();

// function to get db anywhere after connection
function getDB() {
    if (!db) throw new Error('Database not connected yet');
    return db;
}

module.exports = { getDB, ObjectId: require('mongodb').ObjectId };
