const express = require('express');
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');
const router = express.Router();

// Simple auth gate to protect category pages
function requireAuth(req, res, next) {
	if (req.session && req.session.userId) {
		return next();
	}
	return res.redirect('/login');
}

router.get('/hiking', requireAuth, async (req, res) => {
	try {
		const db = getDB();
		const destinations = await db
			.collection('myCollection')
			.find({ type: "destination", category: 'hiking' })
			.project({ name: 1, description: 1, videoUrl: 1 })
			.toArray();

		res.render('hiking', { destinations });
	} catch (error) {
		console.error('Error loading hiking destinations:', error);
		res.status(500).render('hiking', {
			destinations: [],
			error: 'Unable to load hiking destinations right now.'
		});
	}
});

router.get('/cities', requireAuth, async (req, res) => {
	try {
		const db = getDB();
		const destinations = await db
			.collection('myCollection')
			.find({ type: "destination", category: 'cities' })
			.project({ name: 1, description: 1, videoUrl: 1 })
			.toArray();

		res.render('cities', { destinations });
	} catch (error) {
		console.error('Error loading cities destinations:', error);
		res.status(500).render('cities', {
			destinations: [],
			error: 'Unable to load city destinations right now.'
		});
	}
});

router.get('/islands', requireAuth, async (req, res) => {
	try {
		const db = getDB();
		const destinations = await db
			.collection('myCollection')
			.find({ type: "destination", category: 'islands' })
			.project({ name: 1, description: 1, videoUrl: 1 })
			.toArray();

		res.render('islands', { destinations });
	} catch (error) {
		console.error('Error loading islands destinations:', error);
		res.status(500).render('islands', {
			destinations: [],
			error: 'Unable to load island destinations right now.'
		});
	}
});

router.get('/destination/:name', requireAuth, async (req, res) => {
	const { name } = req.params;

	try {
		const db = getDB();
		const destination = await db.collection('myCollection').findOne({ type: "destination", name });

		if (!destination) {
			return res.status(404).render('destination', {
				destination: null,
				error: 'Destination not found.'
			});
		}

		res.render('destination', { destination });
	} catch (error) {
		console.error('Error loading destination:', error);
		res.status(500).render('destination', {
			destination: null,
			error: 'Unable to load this destination right now.'
		});
	}
});

	router.post('/add-to-wanttolist', requireAuth, async (req, res) => {
	const { destinationName } = req.body;
	const userId = req.session.userId;

	if (!destinationName) {
		return res.status(400).json({ success: false, message: 'Destination name is required' });
	}

	try {
		const db = getDB();

		// Verify destination exists
		const destination = await db.collection('myCollection').findOne({ type: "destination", name: destinationName });
		if (!destination) {
			return res.status(404).json({ success: false, message: 'Destination not found' });
		}

		// Convert userId to ObjectId if it's a string
		let userObjectId = userId;
		if (typeof userId === 'string') {
			userObjectId = new ObjectId(userId);
		}

		// Add to user's want-to-go list (avoid duplicates with $addToSet)
		const result = await db.collection('myCollection').updateOne(
			{ type: "user", _id: userObjectId },
			{
				$addToSet: { wantToGo: destinationName }
			}
		);

		// If modifiedCount is 0, the item was already in the list (not added)
		if (result.modifiedCount === 0 && result.matchedCount > 0) {
			return res.status(200).json({ success: true, message: 'Already in your Want-to-Go list' });
		}

		res.json({ success: true, message: 'Added to Want-to-Go list!' });
	} catch (error) {
		console.error('Error adding to want-to-go list:', error);
		res.status(500).json({ success: false, message: 'Failed to add destination' });
	}
});

router.get('/wanttogo', requireAuth, async (req, res) => {
	const userId = req.session.userId;

	try {
		const db = getDB();

		// Convert userId to ObjectId if it's a string
		let userObjectId = userId;
		if (typeof userId === 'string') {
			userObjectId = new ObjectId(userId);
		}

		// Get user's wantToGo array
		const user = await db.collection('myCollection').findOne(
			{ type: "user", _id: userObjectId },
			{ projection: { wantToGo: 1 } }
		);

		if (!user || !user.wantToGo || !Array.isArray(user.wantToGo)) {
			return res.render('wanttogo', { destinations: [] });
		}

		// Fetch full destination details for each name in the wantToGo array
		const destinations = await db
			.collection('myCollection')
			.find({ type: "destination", name: { $in: user.wantToGo } })
			.project({ name: 1, description: 1, category: 1, videoUrl: 1 })
			.toArray();

		res.render('wanttogo', { destinations });
	} catch (error) {
		console.error('Error loading want-to-go list:', error);
		res.status(500).render('wanttogo', {
			destinations: [],
			error: 'Unable to load your Want-to-Go list right now.'
		});
	}
});

router.post('/search', requireAuth, async (req, res) => {
	const { Search } = req.body;

	if (!Search || Search.trim() === '') {
		return res.render('searchresults', {
			destinations: [],
			query: '',
			message: 'Please enter a search term.'
		});
	}

	try {
		const db = getDB();
		
		// Use regex for case-insensitive partial matching
		const destinations = await db
			.collection('myCollection')
			.find({ type: "destination", name: { $regex: Search, $options: 'i' } })
			.project({ name: 1, description: 1, category: 1, videoUrl: 1 })
			.toArray();

		res.render('searchresults', {
			destinations,
			query: Search,
			message: destinations.length === 0 ? `No destinations found matching "${Search}"` : null
		});
	} catch (error) {
		console.error('Error searching destinations:', error);
		res.status(500).render('searchresults', {
			destinations: [],
			query: Search,
			message: 'An error occurred while searching. Please try again.'
		});
	}
});

module.exports = router;
	