// server.ts

import express from 'express';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Firebase Admin SDK
const serviceAccount = require('./path/to/your/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
});

// Middleware
app.use(bodyParser.json());

// Sample API endpoint for sending messages
app.post('/send-message', async (req, res) => {
    try {
        const { registrationToken, message } = req.body;

        const payload = {
            notification: {
                title: 'New Message',
                body: message
            }
        };

        const response = await admin.messaging().sendToDevice(registrationToken, payload);
        console.log('Message sent successfully:', response);

        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Error sending message' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
