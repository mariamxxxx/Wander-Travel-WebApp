const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.DB_URL;
let db;
let client;

async function connectDB() {
    try {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db('travelDB');
        console.log('✅ MongoDB connected successfully');
        return db;
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        throw err;
    }
}

function getDB() {
    if (!db) throw new Error('Database not connected yet. Call connectDB() first.');
    return db;
}

module.exports = { connectDB, getDB, ObjectId };