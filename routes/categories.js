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

// Hardcoded hiking destinations
const hikingDestinations = [
	{
		name: 'Annapurna Base Camp',
		description: 'A challenging trek in Nepal with stunning mountain views.',
		videoUrl: 'https://www.youtube.com/embed/sEIhc_ozhr8?si=gytT1EqhWLCeSX4b'
	},
	{
		name: 'Inca Trail',
		description: 'A historic trail leading to Machu Picchu in Peru.',
		videoUrl: 'https://www.youtube.com/embed/DYa9A3sHU7U?si=QpLl2ee9ins--YAv'
	},
	{
		name: 'Mount Kilimanjaro',
		description: "Africa's highest peak and a popular multi-day hike.",
		videoUrl: 'https://www.youtube.com/embed/a7B4lXe2naE?si=hq3u0c0_qe7KHl3l'
	},
	{
		name: 'Wadi Degla',
		description: 'A desert hiking spot near Cairo, perfect for day hikes.',
		videoUrl: 'https://www.youtube.com/embed/KVioc5Y3z8o?si=GZLplGHG-AmLd8iR'
	}
];

router.get('/hiking', (req, res) => {
	res.render('hiking', { destinations: hikingDestinations });
});

// Hardcoded cities destinations
const citiesDestinations = [
	{
		name: 'Paris',
		description: 'The capital of France, known for the Eiffel Tower and Louvre Museum.',
		videoUrl: 'https://www.youtube.com/embed/UfEiKK-iX70'
	},
	{
		name: 'Rome',
		description: 'The Eternal City with ancient ruins like the Colosseum and Roman Forum.',
		videoUrl: 'https://www.youtube.com/embed/oSexfR0Ubzw'
	}
];

router.get('/cities', (req, res) => {
	res.render('cities', { destinations: citiesDestinations });
});

// Hardcoded islands destinations
const islandsDestinations = [
	{
		name: 'Bali Island',
		description: 'Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs.',
		videoUrl: 'https://www.youtube.com/embed/zFzjBmx5G1Q?si=8rHt_cSgqwbEaXiH'
	},
	{
		name: 'Santorini Island',
		description: 'Greek island in the Aegean Sea, known for its white-washed buildings, blue domes, and stunning sunsets.',
		videoUrl: 'https://www.youtube.com/embed/QBYtknYuMcQ?si=YAaxVO3GqFIu5ouv'
	}
];

router.get('/islands', (req, res) => {
	res.render('islands', { destinations: islandsDestinations });
});

// All hardcoded destinations
const allDestinations = [...hikingDestinations, ...citiesDestinations, ...islandsDestinations];

router.get('/destination/:name', requireAuth, async (req, res) => {
	const { name } = req.params;
	const decodedName = decodeURIComponent(name);

	try {
		// Find destination from hardcoded data
		const destination = allDestinations.find(d => d.name === decodedName);

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
		// Verify destination exists in hardcoded data
		const destination = allDestinations.find(d => d.name === destinationName);
		if (!destination) {
			return res.status(404).json({ success: false, message: 'Destination not found' });
		}

		const db = getDB();

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

		// Get full destination details from hardcoded data for each name in the wantToGo array
		const destinations = user.wantToGo
			.map(name => allDestinations.find(d => d.name === name))
			.filter(d => d !== undefined);

		res.render('wanttogo', { destinations });
	} catch (error) {
		console.error('Error loading want-to-go list:', error);
		res.status(500).render('wanttogo', {
			destinations: [],
			error: 'Unable to load your Want-to-Go list right now.'
		});
	}
});

router.post('/search', requireAuth, (req, res) => {
	const { Search } = req.body;

	if (!Search || Search.trim() === '') {
		return res.render('searchresults', {
			destinations: [],
			query: '',
			message: 'Please enter a search term.'
		});
	}

	try {
		// Search through hardcoded destinations with case-insensitive matching
		const destinations = allDestinations.filter(d =>
			d.name.toLowerCase().includes(Search.toLowerCase())
		);

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
	