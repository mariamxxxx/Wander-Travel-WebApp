const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.DB_URL);
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('myDB');
        console.log('✅ MongoDB connected to dohabadrawy cluster');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
    }
}

// function to get db anywhere after connection
function getDB() {
    if (!db) throw new Error('Database not connected yet');
    return db;
}

module.exports = { connectDB, getDB, ObjectId: require('mongodb').ObjectId };
