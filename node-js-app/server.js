const express = require('express');
const dotenv = require('dotenv');
const newsRoutes = require('./routes/newsRoutes');
const authRoutes = require('./routes/authRoutes');
const handleError = require('./utils/errorHandler');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');
const admin = require('firebase-admin');
const { Firestore } = require('@google-cloud/firestore');

dotenv.config();

const db = new Firestore();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Routes
app.use('/api/news', newsRoutes);
app.use('/api/auth', authRoutes);

// Contactus route
app.post('/api/contactus', async (req, res) => {
  console.log('Request received at /api/contactus');

  try {
    const tokenValue = req.headers['authorization']?.split(' ')[1];
    if (!tokenValue) {
      console.error('No token provided.');
      return res.status(400).json({ message: 'No token provided.' });
    }

    const decodedToken = await admin.auth().verifyIdToken(tokenValue);
    const userId = decodedToken.uid;
    console.log('User ID:', userId);

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      console.error('Validation failed: Missing required fields.');
      return res.status(400).json({ message: 'All fields (name, email, message) are required.' });
    }

    const contactusData = {
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    };

    const contactusRef = db.collection('users').doc(userId).collection('contactus');
    await contactusRef.add(contactusData);
    console.log('Contactus entry saved to Firestore.');

    return res.status(201).json({ message: 'Contactus entry created successfully.' });

  } catch (error) {
    console.error('Error during contactus creation:', error.message);
    return res.status(500).json({ message: 'Internal server error.', details: error.message });
  }
});

// Prediction route
app.post('/api/predict', async (req, res) => {
  console.log('Request received at /api/predict');

  try {
    if (!req.files || !req.files.file) {
      console.error('No file provided.');
      return res.status(400).json({ message: 'No file provided.' });
    }

    const file = req.files.file;
    console.log('File received:', file.name);

    const tokenValue = req.headers['authorization']?.split(' ')[1];
    if (!tokenValue) {
      console.error('No token provided.');
      return res.status(400).json({ message: 'No token provided.' });
    }

    const decodedToken = await admin.auth().verifyIdToken(tokenValue);
    const userId = decodedToken.uid;
    console.log('User ID:', userId);

    const formData = new FormData();
    formData.append('file', file.data, file.name);

    console.log('Sending request to Flask...');
    const response = await axios.post('https://skincure-flask-v2-1002330865172.asia-southeast1.run.app/predict', formData, {
      headers: {
        'Authorization': `Bearer ${tokenValue}`,
        ...formData.getHeaders(),
      },
    });
    console.log('Response from Flask:', response.data);

    const { result, description, status_code, confidence_score, image_url } = response.data;

    const predictionData = {
      uid: userId,
      result: response.data.result,
      createdAt: new Date().toISOString(),
      description: response.data.description,
      status_code: response.data.status_code,
      confidence_score: response.data.confidence_score,
      image_url: response.data.image_url
    };

    const predictionsRef = db.collection('predictions');
    await predictionsRef.add(predictionData);
    console.log('Prediction saved to Firestore.');

    return res.status(200).json(response.data);

  } catch (error) {
    if (error.response) {
      console.error('Flask error:', error.response.data);
      return res.status(500).json({ message: 'Error from Flask', details: error.response.data });
    } else if (error.request) {
      console.error('No response from Flask:', error.request);
      return res.status(500).json({ message: 'No response from Flask' });
    } else {
      console.error('Error during prediction:', error.message);
      return res.status(500).json({ message: 'Internal server error.', details: error.message });
    }
  }
});

// Get prediction histories
app.get('/api/predict/histories', async (req, res) => {
  try {
    const tokenValue = req.headers['authorization']?.split(' ')[1];
    if (!tokenValue) {
      console.error('No token provided.');
      return res.status(400).json({ message: 'No token provided.' });
    }

    const decodedToken = await admin.auth().verifyIdToken(tokenValue);
    const userId = decodedToken.uid;
    console.log('User ID:', userId);

    const predictionsRef = db.collection('predictions');
    const snapshot = await predictionsRef.where('uid', '==', userId).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No prediction history found.' });
    }

    const histories = snapshot.docs.map(doc => doc.data());
    return res.status(200).json({ histories });

  } catch (error) {
    console.error('Error retrieving prediction history:', error.message);
    return res.status(500).json({ message: 'Error retrieving prediction history', details: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  handleError(err, res);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
