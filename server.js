const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt'); // Ensure bcrypt is installed (npm install bcrypt)

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Session setup
app.use(session({
    secret: 'your_secret_key', // Use a strong secret key for session encryption
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // Ensure username is unique
    email: { type: String, required: true, unique: true }, // Ensure email is unique
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Opinion Schema
const opinionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    classSection: { type: String, required: true },
    opinionText: { type: String, required: true }
});

const Opinion = mongoose.model('Opinion', opinionSchema);

// Endpoint to submit opinion
app.post('/submit-opinion', async (req, res) => {
    const { name, classSection, opinionText } = req.body;

    const opinion = new Opinion({ name, classSection, opinionText });
    try {
        await opinion.save();
        res.status(201).send('Opinion submitted successfully!');
    } catch (error) {
        res.status(400).send('Error submitting opinion: ' + error.message);
    }
});

// Endpoint to get opinions
app.get('/opinions', async (req, res) => {
    try {
        const opinions = await Opinion.find();
        res.json(opinions);
    } catch (error) {
        res.status(500).send('Error fetching opinions: ' + error.message);
    }
});

// Check login status
app.get('/check-login', (req, res) => {
    res.json({ isLoggedIn: req.session.isLoggedIn || false });
});

// Endpoint to handle login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.isLoggedIn = true;
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        res.status(500).send('Error during login: ' + error.message);
    }
});

// Endpoint to handle registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).send('Username already taken. Please choose another one.');
            }
            if (existingUser.email === email) {
                return res.status(400).send('Email already registered. Please use a different email.');
            }
        }

        // Hash the password before storing it
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Create and save the new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).send('Registration successful Soon classes will start');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('An error occurred during registration.');
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
